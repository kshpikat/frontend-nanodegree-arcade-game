/**
 * Returns a random integer in the border from min to max
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Return true if rectangle a intersects with rectangle b
 */
function collision(a, b) {
    return  a.x < (b.x + b.width)   && (a.x + a.width)  > b.x
        &&  a.y < (b.y + b.height)  && (a.y + a.height) > b.y;
}