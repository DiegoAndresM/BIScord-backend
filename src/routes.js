const express = require('express');
const router = express.Router();
const UserModel = require('./models/user.model.js')
const bcrypt = require('bcrypt');
const userModel = require('./models/user.model.js');
const msgModel = require('./models/messages.model.js')
//RSA
const pkModel = require('./models/privateKey.model.js');
const pukModel = require('./models/publicKey.model.js');
const rsaKeys = require('./rsaKeys.js');
const msg = require('./rsaMessages.js');

// Define routes
router.post('/createUser', async (req, res) => {
    try {
        console.log(req.body)
        const { username, email, password} = req.body

        const existingUser = await UserModel.findOne({ email });
        if (existingUser){
            return res.status(400).json({message: "[-] Email already exists"})
        }
        //user info
        const encryptedPassword = await bcrypt.hash(password,10)
        const newUser = new UserModel({username,email,password: encryptedPassword})

        //Keys info
        const keys = rsaKeys(newUser.email);
        const privateKey = new pkModel({userId: newUser.email, key: keys.privateKey});
        const publicKey = new pukModel({userId: newUser.email, key: keys.publicKey});
        await privateKey.save();
        await publicKey.save();

        await newUser.save()
        res.status(201).json(newUser)
    } catch (error) {++
        res.status(500).json({message: '[-] '+ error.message})
    }
});

router.post('/authUser', async (req, res) => {
 try {
    const { email, password} = req.body
    console.log(req.body)
    const user = await userModel.findOne({email})
    if (!user || !(await bcrypt.compare(password,user.password))){
        return res.status(401).json({message: '[-] Invalid email or password'})
    }
    res.status(200).json(user)
 } catch (error) {
    res.status(500).json({message:'[-] '+ error.message})
 }
});

router.get("/getUsers", async(req, res)=>{
    try{
        const users = await userModel.find().select('username email');
        res.status(200).json(users);
    }catch{
        res.status(404).json({message: "Not users found"})
    }
});

router.post("/getChat", async(req, res)=>{
    
    
    try{
        const {senderId, receptorId} = req.body

        const sentMessages = await msgModel.find({senderId,receptorId})
        const recivedMessages = await msgModel.find({senderId: receptorId, receptorId: senderId})

        const receptorPkey = await pkModel.find({userId: receptorId}).select(`key`)
        const senderPkey = await pkModel.find({userId: senderId}).select(`key`)
      
        let decryptedSent = []
        let decryptedRecived = []

         for(let i = 0; i<sentMessages.length; i++){
            const currentDecryptedMsg = msg.decryptMessage(sentMessages[i].content, receptorPkey[0].key, receptorId)
            const formarMSG = {
                "senderId": senderId,
                "receptorId": receptorId,
                "content": currentDecryptedMsg,
                "createdAt": recivedMessages[i].createdAt
            }
            decryptedSent.push(formarMSG)
        } 


        for(let i = 0; i<recivedMessages.length; i++){
            const currentDecryptedMsg = msg.decryptMessage(recivedMessages[i].content, senderPkey[0].key, senderId)
            const formarMSG = {
                "senderId": receptorId,
                "receptorId": senderId,
                "content": currentDecryptedMsg,
                "createdAt": recivedMessages[i].createdAt
            }
            decryptedRecived.push(formarMSG)
        } 

        const chat = [...decryptedSent, ...decryptedRecived]
        chat.sort((a, b) => a.createdAt - b.createdAt)
        res.status(200).json(chat);
    }catch{
        res.status(404).json({message: "Not users found"})
    }
});
module.exports = router;