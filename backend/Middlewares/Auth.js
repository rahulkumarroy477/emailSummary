const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req,res,next) => {
    const auth = req.headers['authorization'];
    const appPassword = req.headers['app-password'];
    console.log(appPassword);
    if(!auth){
        return res.status(403).json({message:'Unauthorized, valid Token required'});
    }
    if(appPassword.length==0){
        return res.status(403).json({message:'App Password required to read your emails'});
    }
    
    try{
        const decodedData = jwt.verify(auth,process.env.JWT_SECRET);
        req.user = decodedData;
        
        req.appPassword = appPassword;
        
        next();
    } catch(err){
        return res.status(401).json({message:'Unauthorized, Token missing or expired'});
    }
}

module.exports = ensureAuthenticated;