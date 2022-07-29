const httpError = (res, err) =>{
    res.status(500)
    res.send({error: 'error'})
}

module.exports = {httpError}