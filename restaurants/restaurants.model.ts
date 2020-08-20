import * as mongoose from 'mongoose'

export interface MenuItem extends mongoose.Document {
  name: string,
  price: number
}

export interface Restaurant extends mongoose.Document{
  name: string,
  menu: MenuItem[]
}

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  }
})

const restSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  menu: {
    type: [menuSchema],
    required: false,
    select: false,//não retorna num find() tradicional
    default: []//para inicializar, porém o mongoose já faz isso
  }
})

export const Restaurant = mongoose.model<Restaurant>('Restaurant', restSchema)
