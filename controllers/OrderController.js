const OrderModel = require("../models/OrderModel");
const ProductModel = require("../models/ProductModel.js");
const UserModel = require("../models/UserModel.js");
const nodemailer = require("nodemailer");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    }
});

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
                firstName: firstName,
                lastName: lastName,
                mobileNo: mobileNo,
                streetAddress: streetAddress,
                townCity: townCity,
                state: state,
                country: country,
                zipcode: zipcode,
            },
            items: items,
        }
        const order = await OrderModel.create(data);
        const cust = await UserModel.findOne({ _id: customerId })

        if (order) {
            const mail = {
                from: '"Big Basket" <bigbasket@gmail.com>',
                to: `'"${cust.username}" <${cust.email}>'`,
                subject: "Your Order has been placed",
                text: `Your Order ${orderNo} has been placed successfully.`,
                html: `<p>Your Order ${orderNo} has been placed successfully.</p>`,
            }

            let info = await transporter.sendMail(mail);
            res.json({
                status: 'success',
                msg: 'Order has been saved'
            });
        }
    } catch (err) {
        console.log(`make order error: ${err}`)
    }
}

async function checkoutSession(req, res) {
    try {
        const { ids } = req.body;
        const products = await ProductModel.find({ _id: { $in: ids } });

        const line_items = products.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: { name: item.title },
                unit_amount: Math.round(item.sellingPrice * 100),
            },
            quantity: 1,
        }));

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
            const mail = {
                from: '"Big Basket" <bigbasket@gmail.com>',
                to: `'"${username}" <${email}>'`,
                subject: `Your Order has been ${orderStatus}`,
                text: `Your Order ${orderNo} has been ${orderStatus} successfully.`,
                html: `<p>Your Order ${orderNo} has been ${orderStatus} successfully.</p>`,
            }

            let info = await transporter.sendMail(mail);
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

module.exports = { makeOrder, checkoutSession, getAllOrders, getOneOrder, changePaymentStatus, changeOrderStatus }