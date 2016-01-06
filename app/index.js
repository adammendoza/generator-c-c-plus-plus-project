var chalk = require('chalk'),
    generators = require('yeoman-generator'),
    us = require('underscore.string');

exports = module.exports = generators.Base.extend({
  _makeDestDir: function(dir) {
    var newDir = this.destinationPath(dir);
    if (!this.fs.exists(newDir)) {
      this.mkdir(newDir);
    }
  },
  _copyToDestWithTemplate: function (from, to, template) {
    this.fs.copyTpl(
      this.templatePath(from),
      this.destinationPath(to),
      template);
  },
  prompting: function () {
    var done = this.async();

    var prompts = [{
      name: 'generatorModuleName',
      message: 'What is your module\'s name ?',
      default : this.determineAppname(),
      desc: 'Name of your module. We will create an app with this name in current directory'
    }];

    this.prompt(prompts, function (answers) {
      this.answers = answers;
      done();
    }.bind(this));
  },
  deriveAnswers: function() {
    this.answers['generatorModuleClass'] = us.classify(this.answers['generatorModuleName']);
    this.answers['generatorModuleNameWithUnderscores'] = us(
      this.answers['generatorModuleName']).decapitalize().underscored().value();

  },
  askModuleWebsite: function() {
    var done = this.async();
    var prompts = [ {
      name: 'generatorModuleNameWithUnderscores',
      message: 'What is your module\'s underscored name ? Will use this as the main module name:',
      default : this.answers['generatorModuleNameWithUnderscores'],
      desc: 'Main exported class from entry file.'
    }, {
      name: 'generatorModuleDescription',
      message: 'What is your module\'s description ?',
      default : this.determineAppname(),
      desc: 'Description of your module.'
    }, {
      name: 'generatorUserEmail',
      message: 'What is your email ?',
      default : this.user.git.email(),
      desc: 'Your email, does into package.json'
    }, {
      name: 'generatorUserName',
      message: 'What is your name ?',
      default : this.user.git.name(),
      desc: 'Your name, does into package.json'
    }];
    this.prompt(prompts, function (answers) {
      var propNames = Object.getOwnPropertyNames(answers);
      for (var i = 0; i < propNames.length; i++) {
        this.answers[propNames[i]] = answers[propNames[i]];
      }
      done();
    }.bind(this));
  },
  fixUsername: function() {
    this.answers['generatorUserName'] = us.titleize(this.answers['generatorUserName']);
  },
  tellUserOurTemplate: function(){
    this.log('We will use the values below for templating:');
    this.log(this.answers);
  },
  scaffoldFolders: function(){
    this._makeDestDir('src');
    this._makeDestDir('my_inc');
  },
  copyFiles: function(){
    this.copy('_gitignore', '.gitignore');
    this.template('_configure.ac', 'configure.ac', this.answers);
    this.copy('_Makefile.am', 'Makefile.am');
    this.template('_AUTHORS', 'AUTHORS', this.answers);
    this.template('_LICENCE.md', 'LICENCE.md', this.answers);
    this.template('_README.md', 'README.md', this.answers);
    // src dir
    this.template('_src/_Makefile.am', 'src/Makefile.am', this.answers);
    this.copy('_src/_main.cpp', 'src/' + this.answers['generatorModuleNameWithUnderscores'] + '.cpp');
    this.copy('_src/_helper.cc', 'src/helper.cc');
    this.copy('_src/_helper.cpp', 'src/helper.cpp');
    this.copy('_src/_helper.h', 'src/helper.h');

    // my_inc dir
    this.copy('_my_inc/_Makefile.am', 'my_inc/Makefile.am');
    this.copy('_my_inc/_myadd.cpp', 'my_inc/myadd.cpp');
    this.copy('_my_inc/_myadd.h', 'my_inc/myadd.h');

  },
  finalRound: function() {
    console.log(chalk.yellow('\nEverything is ready!\n'));
    console.log(chalk.yellow('You can type "aclocal", "autoconf" and "automake --add-missing" to configure your library.'));
    console.log(chalk.yellow('Next type "./configure", and "make" and voila, your binary ' +
                             this['generatorModuleNameWithUnderscores'] + ' under src directory'));
    console.log(chalk.cyan('\nFor more information, refer to README.md.'));
    console.log(chalk.green('\nEnjoy the ride, and have fun coding!'));
  }
});
