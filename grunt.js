/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/**n * <%= pkg.title || pkg.name %> | <%= pkg.version %> | ' + '<%= grunt.template.today("yyyy-mm-dd") %>n' + ' * <%= pkg.homepage ? pkg.homepage : "" %>n' + ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>n */'
    },
    lint: {
      files: ['lib/*.js']
    },
    qunit: {
      files: []
    },
    watch: {
      files: ['lib/*.js'],
      tasks: 'lint'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        strict: false,
        loopfunc: true
      },
      globals: {}
    },
    uglify: {}
  });
  
  // Default task.
  grunt.registerTask('default', 'lint');

};