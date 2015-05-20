Asta4js is a MVVM framework which allows independent html template and separate rendering/binding logic to independent js file from html template.


## source taste

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

See more details at [Asta4js wiki](https://github.com/astamuse/asta4js/wiki)

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
    * Aj.form should allow meta override
* docs
    * complete the basic user guide and reference(in progress)
* virtual component(web component support)
    * **Not yet started.**

Any issue report or contribution/PR is appreciated.