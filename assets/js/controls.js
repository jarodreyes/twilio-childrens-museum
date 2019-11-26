var xmlns = "http://www.w3.org/2000/svg",
	xlinkns = "http://www.w3.org/1999/xlink",
	select = function(s) {
		return document.querySelector(s);
	},
	selectAll = function(s) {
		return document.querySelectorAll(s);
	}

var animation = document.querySelector("body > svg.orbit7 > circle > animateMotion")

function showSVG(){
	animation.beginElement();
}
	
setTimeout(()=> {
	showSVG()
}, 3000)

TweenMax.set('svg', {
	visibility: 'visible'
})





var tl = new TimelineMax();