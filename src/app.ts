import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application, Request, Response } from 'express'
import httpStatus from "http-status"
import config from './app/config'
import { globalErrorHandler } from './app/middleware/globalErrorHandler'
import { notFound } from './app/middleware/notFound'
import { AuthRoutes } from './app/module/auth/auth.route'
import { UserRoutes } from './app/module/user/user.route'
import { AdminRoutes } from './app/module/admin/admin.route'
import { PaymentRoutes } from './app/module/payments/payments.route'
import { ShareRoutes } from './app/module/share/share.route'

const app: Application = express()

app.use(
    cors({
        origin: config.frontend_url,
        credentials: true,
    }),
)

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }))

// Middleware to parse JSON bodies
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', AuthRoutes)
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/payments", PaymentRoutes);
app.use("/api/v1/share", ShareRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Welcome to Hunter Islamic Agro Farm System Backend',
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app
