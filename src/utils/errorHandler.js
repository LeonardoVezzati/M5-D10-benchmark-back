export const badRequest = (err, req, res, next) => {
  if(err.status === 400){
    res.status(400).send(err.message)
  }else{
    next(err)
  }
}
export const forbidden = (err, req, res, next) => {
  if(err.status === 403){
    res.status(403).send(err.message)
  }else{
    next(err)
  }
}
export const notFound = (err, req, res, next) => {
  if(err.status === 404){
    res.status(404).send(err.message)
  }else{
    next(err)
  }
}
export const catchAll = (err, req, res, next) => {
  if(err) res.status(500).send(err.message)
  next()
}





