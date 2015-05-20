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

## guide

See [Asta4js wiki](https://github.com/astamuse/asta4js/wiki)