const menu = document.querySelector('.menu-icon')
const navlist = document.querySelector('.nav-list')
function toggle() {
    if(!menu) {
        return
    }
    const children = menu.querySelectorAll('span')
    if (navlist.classList.contains('show')) {
        children.forEach(ele => {
            ele.classList.remove('open')
        });
        navlist.classList.remove('show')
    } else  {
        children.forEach(ele => {
            ele.classList.add('open')
        });
        navlist.classList.add('show')
    }
}