# Tree rendering comparison

For most MVVM frameworks, it is difficult to implement an infinite nested tree rendering/binding.

For AngularJS, it becomes simple by making use of a third-party plug-in called [Angular-UI-Tree](https://github.com/angular-ui-tree/angular-ui-tree). As comparison, For Asta4js, it can be simply implemented by the default binding mechanism without any extra plug-in.

There is a pair of pages to compare what is different between AngluarJS(Angluar-UI-Tree) and Asta4js for tree rendering/binding.

- [Tree rendering by Asta4js](asta4js.html)
- [Tree rendering by Angular-UI-Tree](angularUITree.html)



## What is different?

- Asta4js
    - Pros
        - Very clean pure HTML template with high maintainability
    - Cons
        - The javascript side's source is a little bit complicated than Angular's way.
        - Without common tasks(expand/collapse, drag/drop) support, but to be honest, all of those can be done simply.
- Angluar-UI-Tree
    - Pros
        - The logic in javascript is clean and simple
        - With plenty built-in common tasks support, such as expand/collapse, drag/drop, etc.
    - Cons
        - The HTML template is chaos, even with HTML code in script tag.

