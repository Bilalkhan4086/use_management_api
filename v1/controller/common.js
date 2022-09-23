const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ErrorHandler = require("../utils/ErrorHandler");
const { sendCookieResponse } = require("./admin");

// getting refresh token


exports.refreshAccessToken = (req, res, next) => {
    let refreshToken ;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        refreshToken = req.headers.authorization.split(" ")[1];
      }
    if(!refreshToken){
        return(
            next(new ErrorHandler("Refresh Token not found",401))
        )
    }
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET, async(err,data)=>{
        if(err){
            return next(new ErrorHandler("Refresh token is not valid. hint : You should login again",401))
        }else{
            try{
                const {userName} = data;
            const user = await User.findOne({userName});
            const newRefreshToken = user.signJWTRefreshToken();
            sendCookieResponse(user,res,200,newRefreshToken)
        }catch(err){
            return next(new ErrorHandler("Refresh token is InValid. hint : You should login again",401))
        }
        }
    })
  };
  