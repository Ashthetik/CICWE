import { Express, Router } from "express"
import mainRoutes from "./routes"

const routes = (app: Express) => {
    app.use('/', mainRoutes)
};

export default routes;