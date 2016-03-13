# Morphing Buttons
Makes buttons morph into overlays.

Based on Morphing Buttons Concept by Codrops.  
http://tympanus.net/Development/ButtonComponentMorph/

# Installation
1. Include classie.js and JQuery  
2. Add the morphingButtons.js and morphingButtons.css file into your HTML
3. Include Modernizr (<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js"></script>)

# How To Use
## Full Screen Overlays

### Steps
1. Add the class "morph-button morph-button-overlay morph-button-fixed" into a div.
2. Add the class "morph-content" into an element inside this div.

###Sample Code

```html
<div class="morph-button morph-button-overlay morph-button-fixed">
    <button type="button">Morph To Full Screen</button>
    <div class="morph-content"> 
            Content
    </div>
</div>
```



### Results
When someone clicks on a div with class __can-morph__  
Then that div will morph into a full-screen overlay with the contents of __morph-content__. 

# Maintainers
Mark Christian D. Lopez

<xmarkclx@gmail.com>
