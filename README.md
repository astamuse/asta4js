Asta4js is a MVVM framework which allows independent html template and separate rendering/binding logic to independent js file from html template.


## Overview

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

More examples can be found at [http://astamuse.github.io/asta4js](http://astamuse.github.io/asta4js)

User guide is at [Asta4js wiki](https://github.com/astamuse/asta4js/wiki)

## Why Asta4js

We have been practicing separating rendering/binding logic from the front-end template files for years, and we believe that separated rendering/binding is the best way to release the productivity of developers and designers since they can completely work independently.

We have created a server side framework [Asta4D](https://github.com/astamuse/asta4d) to achieve our goal years ago,nowadays we believe it is the time to create one for client size programming, thus we created Asta4js.  

## status and road map

Currently, Asta4js is still in alpha developing, which means it still lacks of some important functionalities, but it can be considered as stable for existing functions because we are using it in our service developing.

Todo things:

* build
    * it seems that karma is not a good option for common unit test purpose.
    * CI support(better with sauce)
    * source format and jshint
* binding
    * add test for multiple select
    * add support for option group of select
* docs
    * complete the basic user guide and reference(has almost covered current situations)
    * reimplement the todoApp sample to follow the todoMVC's guide line and submit it to todoMVC.
    * make the user list example more beautiful.
* web component support(in progress)
    * it has been working with [brick](https://mozbrick.github.io/).
        * [example of working with brick](http://astamuse.github.io/asta4js/examples/brick/calendar.html)
    * waiting for confirm with shadow DOM.

Any issue report or contribution/PR is appreciated.