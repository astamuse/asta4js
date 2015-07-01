Asta4js is a MVVM framework which allows independent html template and separate rendering/binding logic to independent js file from html template.


## Overview

- pure html template and separated binding

    There is a simple html template which contains a text input and a preview text label.
    
    ```html
    <div>2w bingind<input name="name"></div>
    <div>1w binging:<span id="name-preview"></span></div>
    ```
    
    Then we can bind the two DOM elements with the javascript model as following:
    
    ```javascript
      Aj.init(function($scope){
        $scope.data = {};
        $scope.snippet("body").bind($scope.data, {
            name:[
               Aj.form(), //bind the $scope.data.name to input[name=name] in 2-way
               "#name-preview" //bind the $scope.data.name to #name-preview in 1-way
            ]
        });
      });
    ```
    
    A complete sample of [todoApp](http://astamuse.github.io/asta4js/examples/todoApp/todoApp.html) shows how we can make things amazing.

- web component support

    Asta4js supports [web component](http://webcomponents.org/) as well, thus we can develope our application on component base as the same as what react or polymer does.

    Even that Asta4js can make use of polymer's components by treating them as standard web component. The [mozilla brick](http://brick.mozilla.io/) can be integrated as well. The details can be found at our wiki page [Web Component Developing](https://github.com/astamuse/asta4js/wiki/Web-Component-Developing)


Plenty examples can be found at [http://astamuse.github.io/asta4js](http://astamuse.github.io/asta4js)

User guide is at [Asta4js wiki](https://github.com/astamuse/asta4js/wiki/User-Guide)

## Why Asta4js

We have been practicing separating rendering/binding logic from the front-end template files for years, and we believe that separated rendering/binding is the best way to release the productivity of developers and designers  both since they can completely work independently.

We had created a server side framework [Asta4D](https://github.com/astamuse/asta4d) to achieve our goal years ago,nowadays we believe it is the time to create one for client side programming, thus we created Asta4js.  

## status and road map

Currently, Asta4js is still in alpha developing, which means it still lacks of some important functionalities, but it can be considered as stable for existing functions because we are using it in our service developing.

Todo things:

* build
    * it seems that karma is not a good option for common unit test purpose.(waiting)
    * CI support(better with sauce)(waiting)
    * source format and jshint(waiting)
* core
    * remove dependency of JQuery, use document.querySelector instead(waiting)
    * add test for multiple select(waiting)
    * add support for option group of select(waiting)
    * performance enhancement, especially for array binding which current implementation is inefficient(waiting)
    * api enhancement for better development friendliness.(in progress)
* example
    * reimplement the todoApp example to follow the [todoMVC's guide line](https://github.com/tastejs/todomvc/blob/master/contributing.md) and submit it to todoMVC.(waiting)
* spa
    * to confirm what else we need for a single page application?(being considered)

Any issue report or contribution/PR is appreciated, especially for the waiting items in above todo things. You can also open issues for discussion.