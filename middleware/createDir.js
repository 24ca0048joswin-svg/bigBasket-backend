const fs = require("fs");
const path = "./invoices";

function create_invoice_dir(){
fs.access(path, (error)=>{
    if(error){
        fs.mkdir(path, (error)=>{
            if(error){
                console.log("Directory creation error:", err);
            }else{
                console.log(`${path} directory is created`);
            }
        })        
    }else{
        console.log("Given directory exists");
    }
});
}

module.exports =  create_invoice_dir;