import { Router } from "express";
import { test } from "../controller/test.js";

const routes = Router()

routes.get("/", test)

export default routes;