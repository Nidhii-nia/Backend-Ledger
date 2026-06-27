const ledgerModel = require("../models/ledger.model");


class LedgerController{
    constructor(){
        this.LedgerModel = new ledgerModel();
    }

    registerTransaction = async(req,res,next) =>{
        try{
            const {fromAccount, toAccount, amount , idempotencyKey} = req.body;
        }catch(e){

        }
    }
}