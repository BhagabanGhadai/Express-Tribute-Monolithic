const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { rateLimit } = require("express-rate-limit");
const session = require("express-session");
const passport = require("passport");
const {env}=require("./env")
const {ApiError} = require("./utils/ApiError");
const {errorHandler} = require("./middlewares/error.middleware")
const {verifyBlackList} = require("./middlewares/auth.middleware")
const morgan = require('morgan')

/**Routers **/
const healthcheckRouter=require("./routes/healthcheck.routes")
const userRouter =require("./routes/user/user.routes")
const imageRouter =require("./routes/images/image.routes")
const footerRouter =require("./routes/footers/footer.routes")
const cuponRouter =require("./routes/cupons/cupon.routes")
const templateRouter =require("./routes/template/template.routes")
const planRouter =require("./routes/plans/plan.routes")
const obituaryRouter =require("./routes/obituary/obituary.routes")
const paymentRouter =require("./routes/payments/payments.routes")

module.exports = async (app) => {
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors({ origin: "*", credentials: true }));
    app.use(cookieParser());
    app.use(morgan('dev'))
    app.use(session({
        secret: env.EXPRESS_SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
    })
    );
    app.use(passport.initialize());
    app.use(passport.session());

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, 
        max: 500,
        standardHeaders: true,
        legacyHeaders: false, 
        handler: (_, __, ___, options) => {
            throw new ApiError(
                options.statusCode || 500,
                `There are too many requests. You are only allowed ${options.max
                } requests per ${options.windowMs / 60000} minutes`
            );
        },
    });
    app.use(limiter);
    app.use(verifyBlackList)

    /**Api's**/

    app.use("/api/v1/healthcheck", healthcheckRouter);
    app.use("/api/v1/user", userRouter);
    app.use("/api/v1/media", imageRouter);
    app.use("/api/v1/footer-link", footerRouter);
    app.use("/api/v1/cupon", cuponRouter);
    app.use("/api/v1/template", templateRouter);
    app.use("/api/v1/plan", planRouter);
    app.use("/api/v1/obituary", obituaryRouter);
    app.use("/api/v1/payment", paymentRouter);

    app.use(errorHandler)

}