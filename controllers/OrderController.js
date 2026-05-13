const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel.js");
const AnalyticsModel = require("../models/AnalyticsModel.js");
const UserModel = require("../models/UserModel.js");
const path = require("path");
const fs = require("fs");
// const { Resend } = require("resend");
// const nodemailer = require("nodemailer");
const generateInvoice = require("../middleware/invoicePdf.js");
const { default: axios } = require("axios");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Nodemailer api configuration
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASSWORD,
//     }
// });

// Resend api configuration
// const resend = new Resend(process.env.RESEND_API_KEY);

// Brevo api configuration
const apiKey = process.env.BREVO_API;
const url = '';

async function makeOrder(req, res) {
    try {
        const { firstName, lastName, mobileNo, streetAddress, townCity, state, country, zipcode, paymentOnline, totalPrice, customerId, items } = req.body;

        const orderNo = `ORD-${Date.now().toString().slice(-8)}`;

        const data = {
            orderNo,
            customer: customerId,
            totalPrice: totalPrice,
            paymentStatus: paymentOnline,
            shippingOrBillingAddress: {
                firstName, lastName, mobileNo, streetAddress, townCity, state, country, zipcode,
            },
            items: items,
        }

        // let ids = []
        // for(item in items){
        //     ids.push(item.productId);
        // }
        const ids = items.map(item => (item.productId));
        // console.log(ids);

        const order = await OrderModel.create(data);
        const cust = await UserModel.findOne({ _id: customerId });

        const products = await ProductModel.find({ _id: { $in: ids } });
        // console.log(`products: ${products}`)

        let formattedItems = items.map(item => {
            const productDetail = products.find(p => p._id.toString() === item.productId.toString());
            // console.log('Product detail', productDetail);
            if (productDetail) {
                return {
                    name: productDetail.title,
                    quantity: item.quantity,
                    price: productDetail.sellingPrice,
                    tax: 18
                };
            }
        });


        if (order) {
            const invoicePath = path.join(__dirname, `../invoices/invoice-${orderNo}.pdf`);
            console.log(invoicePath);

            const invoiceData = {
                invoiceNumber: orderNo,
                date: new Date().toLocaleDateString("en-IN"),
                dueDate: new Date().toLocaleDateString("en-IN"),
                client: {
                    name: `${firstName} ${lastName}`,
                    address: streetAddress,
                    city: townCity,
                    country: country,
                    postal: zipcode
                },
                items: formattedItems
            };

            // console.log(invoiceData)


            let totalQty = 0;
            let totalGst = 0;
            const categoryUpdates = {};

            console.log(formattedItems)
            formattedItems = items.map(item => {
                const productDetail = products.find(p => p._id.toString() === item.productId.toString());
                // console.log('Product detail', productDetail);
                if (productDetail) {
                    return {
                        productId: productDetail._id,
                        name: productDetail.title,
                        quantity: item.quantity,
                        price: productDetail.sellingPrice,
                        tax: 18
                    };
                }
            });

            formattedItems.forEach(item => {
                const productDetail = products.find(p => p._id.toString() === item.productId.toString());
                const qty = item.quantity;
                const itemGst = (item.price * 0.18) * qty;

                totalQty += qty;
                totalGst += itemGst;

                if (productDetail && productDetail.category) {
                    let category = productDetail.category;
                    if (category == "Fresh Vegetables")
                        category = "vegetables";
                    else if (category == "Exotic Fruits")
                        category = "fruits";
                    else if (category == "ghee")
                        category = "ghee"
                    else if (category == "Nandini")
                        category = "nandini"
                    else if (category == "Tea")
                        category = "tea";
                    const catKey = `salesByCategories.${category}`;
                    categoryUpdates[catKey] = qty;
                }
            });

            const monthNames = ["January", "Febrauary", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const currentMonth = monthNames[new Date().getMonth()];
            const monthKey = `salesInEveryMonth.month.${currentMonth}`;
            const date = new Date();
            const year = date.getFullYear();

            await AnalyticsModel.findOneAndUpdate(
                { year },
                {
                    $inc: {
                        totalSales: totalPrice,
                        totalOrder: 1,
                        gstForGovt: totalGst,
                        totalProductSold: totalQty,
                        [monthKey]: totalPrice,
                        ...categoryUpdates
                    }
                },
                { returnDocument: true, new: true }
            );

            await generateInvoice(invoiceData, invoicePath);

            console.log(invoicePath)
            const attachment = fs.readFileSync(`${invoicePath}`).toString('base64');

            // const { data: emailData, error } = await resend.emails.send({
            //     from: 'onboarding@resend.dev',
            //     to: [`${cust.email}`],
            //     subject: "Your Order has been placed",
            //     html: `<p>Your Order ${orderNo} has been placed successfully. Find your invoice attached.</p>`,
            //     attachments: [{ filename: 'invoice.pdf', content: attachment }]
            // });

            // const info = await transporter.sendMail({
            //     from: '"Big Basket" <joswin630@gmail.com>', 
            //     to: [`${cust.email}`],
            //     subject: "Your Order has been placed",
            //     html: `<p>Your Order ${orderNo} has been placed successfully. Find your invoice attached.</p>`,
            //     text: `Your Order ${orderNo} has been placed successfully. Find your invoice attached.`,
            //     attachments: [{ filename: 'invoice.pdf', path: invoicePath }]
            // });

            const emailData = {
                "sender": {
                    "name": "Big Basket",
                    "email": process.env.EMAIL,
                },
                "to": [{
                    "email": cust.email,
                }],
                subject: "Your Order has been placed",
                htmlContent: `<p>Your Order ${orderNo} has been placed successfully. Find your invoice attached.</p>`,
                attachment: [
                    {
                        content: attachment,
                        name: 'invoice.pdf'
                    }
                ]
            };

            const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                }
            })

            // if (error) {
            //     console.log(`Email error: ${error}`);
            //     console.log(error)
            // }

            res.json({
                status: 'success',
                msg: 'Order has been saved and invoice generated',
                orderNo: orderNo
            });
        }
    } catch (err) {
        console.log(`make order error: ${err}`);
        res.status(500).json({ status: 'error', msg: 'Internal server error' });
    }
}

async function checkoutSession(req, res) {
    try {
        const { ids, cart } = req.body;
        const products = await ProductModel.find({ _id: { $in: ids } });

        const line_items = products.map((item) => {
            const currentProduct = cart.find((prod) => {
                if (prod.id == item._id) {
                    return prod.quantity;
                }
            });

            return {
                price_data: {
                    currency: "inr",
                    product_data: { name: item.title },
                    unit_amount: Math.round((item.sellingPrice * 1.18) * 100),
                },
                quantity: currentProduct.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items,
            mode: "payment",
            success_url: "http://localhost:5173/success",
            cancel_url: "http://localhost:5173/cancel",
        })

        res.json({ url: session.url });
    } catch (err) {
        console.log(`checkout session error : ${err}`)
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await OrderModel.find()
            .populate('customer', 'username email')
            .sort({ date: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

async function getOneOrder(req, res) {
    try {
        const { id } = req.body;
        const order = await OrderModel.findOne({ _id: id })
            .populate("items.productId", "productUrl title category")
            .populate('customer', 'username email')
        // console.log(order)

        res.status(200).json(order);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

async function changeOrderStatus(req, res) {
    try {
        const { orderStatus, id, email, username, orderNo } = req.body;

        if (!orderStatus) {
            return res.status(400).json({ message: "orderStatus is required" });
        }

        const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    orderStatus: orderStatus
                }
            },
            { returnDocument: 'before' }
        );



        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        } else {
            // let info = await transporter.sendMail(mail);
            // const { data, error } = await resend.emails.send({
            //     from: '"Big Basket" <bigbasket@gmail.com>',
            //     to: [`${email}`],
            //     subject: `Your Order has been ${orderStatus}`,
            //     html: `<p>Your Order ${orderNo} has been ${orderStatus} successfully.</p>`,
            // });

            // if (error) {
            //     console.log(`Email error:${error}`);
            // }

            const emailData = {
                "sender": {
                    "name": "Big Basket",
                    "email": process.env.EMAIL,
                },
                "to": [{
                    "email": email,
                }],
                subject: `Your Order has been ${orderStatus}`,
                htmlContent: `<p>Your Order ${orderNo} has been ${orderStatus} successfully.</p>`,
            };

            const response = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
                headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json',
                }
            })
        }


        res.status(200).json({
            message: "Order status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
}

async function changePaymentStatus(req, res) {

    try {
        const { paymentStatus, id } = req.body;

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    paymentStatus: paymentStatus
                }
            },
            { returnDocument: 'before' }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Payment status updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
}

async function getCustomerOrders(req, res) {
    try {
        const { custId } = req.body;
        const orders = await OrderModel.find({ customer: custId })
            // .select('items')
            .sort({ date: -1 });

        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching orders' });
    }
};

module.exports = { makeOrder, checkoutSession, getAllOrders, getOneOrder, changePaymentStatus, changeOrderStatus, getCustomerOrders }