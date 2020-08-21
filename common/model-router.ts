import {Router} from './router'
import * as mongoose from 'mongoose'
import {NotFoundError} from 'restify-errors'

export abstract class ModelRouter<D extends mongoose.Document> extends Router {

  pageSize: number = 2

  constructor(protected model: mongoose.Model<D>){
    super()
  }

  protected prepareOne(query: mongoose.DocumentQuery<D,D>): mongoose.DocumentQuery<D,D>{
    return query
  }

  validateId = (req, resp, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
      next(new NotFoundError('Document not found.'))
    }else{
      next()
    }
  }

  findAll = (req, resp, next) => {
    //query= http://localhost:3000/users?_page=3
    let page = parseInt(req.query._page || 1)
    page = page > 0 ? page : 1

    const skip = (page - 1) * this.pageSize

    this.model.find()
      .skip(skip)
      .limit(this.pageSize)
      .then(this.renderAll(resp, next)).catch(next)
  }

  findById = (req, resp, next)=>{
    this.prepareOne(this.model.findById(req.params.id))
      .then(this.render(resp, next))
      .catch(next)
  }

  save = (req, resp, next)=>{
    let document = new this.model(req.body)
    document.save().then(this.render(resp, next)).catch(next)
  }

  //Substitui um doc totalmente
  replace = (req, resp, next)=>{
    //const options = {overwrite: true}//sobrescreve todo o doc, caso esqueça algum atributo este desaparecerá do doc
    (<any>this.model).update({_id: req.params.id}, req.body, {overwrite: true, runValidators: true})
    .exec().then(result=>{
      if(result.n){
        return this.model.findById(req.params.id)
      }else{
        throw new NotFoundError('Documento não encontrado.')
      }
    }).then(this.render(resp, next)).catch(next)
  }

  //Atualiza apenas os atribudos do doc que estão no req sem fazer overwrite
  update = (req, resp, next)=>{
    const options = {new: true, runValidators: true}
    this.model.findByIdAndUpdate(req.params.id, req.body, options).then(this.render(resp, next)).catch(next)
  }

  delete = (req, resp, next)=>{
    this.model.remove({_id: req.params.id}).exec().then((cmdResult: any)=>{
      if(cmdResult.result.n){
        resp.send(204)
      }else{
        throw new NotFoundError('Documento não encontrado.')
      }
      return next()
    }).catch(next)
  }
}
