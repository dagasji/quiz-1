var models = require('../models/models.js');

/*
//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.findById(quizId).then(
        function(quiz){
            if (quiz){
                req.quiz = quiz;
                next();
            } else {  next(new Error('No existe quizId=' + quizId)); }
        }
    ).catch(function(error){next(error);});
};
*/
exports.load = function(req, res, next, quizId){
	models.Quiz.find({
		where: { id: Number(quizId)},
		include: [{ model: models.Comment }]
	}).then(
		function(quiz){
			if(quiz){
				req.quiz = quiz;
				next();
			}else{
				next (new Error('No existe quizId ' + quizId));
			}
		}).catch(function(error){ next(error);});
};


/*
//GET /quizes
exports.index = function (req, res){
	var strBusqueda = "";
	if (req.query.search){
		strBusqueda = req.query.search;
		strBusqueda = "%"+ strBusqueda.replace(/\s+/g,'%')+"%";
		models.Quiz.findAll({where: ["pregunta like ?", strBusqueda]}).then(
			function(quizes) {
				res.render('quizes/index', { quizes: quizes, errors: []});
			}).catch(function(error) { next(error);})
	}else{
		models.Quiz.findAll().then(
			function(quizes) {
				res.render('quizes/index', { quizes: quizes, errors: []});
			}).catch(function(error) { next(error);})
	}
};
*/
exports.index = function(req, res) {

	var string = req.query.search;
	var tema = "%"+req.query.tema+"%";


	if(string == null){
		models.Quiz.findAll({order:[['tematica','ASC']]}).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
		}).catch(function(error){ next(error);});
	}else{
		string = string.replace(" ","%");
		string = "%"+string+"%";
		models.Quiz.findAll({where:{ pregunta:{ $iLike: string}, tematica:{ $iLike: tema}}, order:[['tematica','ASC']]}).then(function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes, errors: []});
	}).catch(function(error){ next(error);});
	}

};



//GET /quizes/:id
exports.show = function(req, res){
    models.Quiz.findById(req.params.quizId).then(function(quiz){
    		res.render('quizes/show',{quiz: req.quiz, errors: []})
	})
};

/*
//GET /quizes/:id/answer
exports.answer = function(req, res){
        var resultado = 'Incorrecto';
        if (req.query.respuesta === req.quiz.respuesta) {
            resultado = 'Correcto';
        }

        res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};
*/
// GET /quizes/answer
exports.answer = function(req, res){
	models.Quiz.findById(req.params.quizId).then(function(quiz){
		if(req.query.respuesta === req.quiz.respuesta){
			res.render('quizes/answer',
				{ quiz: quiz, respuesta: 'Correcto', errors: []});
		}else{
			res.render('quizes/answer',
				{ quiz: req.quiz, respuesta: 'Incorrecto', errors: []});
		}

	})

};

// GET /quizes/new
exports.new = function(req, res) {
  // crea objecto quiz
  var quiz = models.Quiz.build({pregunta: "pregunta", Respuesta: "respuesta", Tematica: "Tematica"});

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build(req.body.quiz);
    //console.log(req.body.quiz);
    quiz.validate().then(
      function(err) {
        if (err) {
          res.render('quizes/new', {quiz: quiz, errors: err.errors});
        } else {
          // guarda en DB los campos pregunta y respuesta de quiz
          quiz.save({fields: ["pregunta", "respuesta", "tematica"]}).then(function() {
            // Redirección HTTP (URL relativo) lista de preguntas
            res.redirect('/quizes');
          })
        }

      } // function err

    ); // then

};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tematica      = req.body.quiz.tematica;

  req.quiz.validate().then(
    function(err) {
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        // guarda en DB los campos pregunta y respuesta de quiz
        req.quiz
        .save({fields: ["pregunta", "respuesta", "tematica"]})
        .then(function() { res.redirect('/quizes'); });
      }
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then(function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};
