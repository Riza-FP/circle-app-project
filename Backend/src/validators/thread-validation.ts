import Joi from "joi";

export const createThreadSchema = Joi.object({
    content: Joi.string().min(1).max(280).optional(),
    image: Joi.string().optional(),
}).or("content", "image");
