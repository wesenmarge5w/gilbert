// Theme: Bespoke
// Sticky menu
function getNavbarHeight() {
	const rootStyles = getComputedStyle(document.documentElement);
	const navbarHeight = rootStyles.getPropertyValue('--navbar-height');
	return parseInt(navbarHeight); // Convert to integer
}

// Sticky menu
const header = document.getElementById("js-header");
const stickyMenu = document.getElementById("js-navbar-menu");
const hiddenClass = "is-hidden";
const visibleClass = "is-visible";
const stickyClass = "is-sticky";
let lastScrollY = 0;
let isTicking = false;

// Function to get the actual height of the header element
function getNavbarHeight() {
    return header.offsetHeight;
}

window.addEventListener('scroll', () => {
    const navbarHeight = getNavbarHeight(); // Get the actual navbar height

    if (!isTicking) {
        window.requestAnimationFrame(() => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > navbarHeight) {
                // Scrolling down and past the navbar height
                header.classList.remove(visibleClass);
                header.classList.add(hiddenClass);
            } else if (currentScrollY < lastScrollY) {
                // Scrolling up
                header.classList.remove(hiddenClass);
                header.classList.add(visibleClass);

                if (stickyMenu) {
                    stickyMenu.classList.add(stickyClass);
                }
            }

            if (currentScrollY <= 1) {
                // At the top of the page
                header.classList.remove(visibleClass);

                if (stickyMenu) {
                    stickyMenu.classList.remove(stickyClass);
                }
            }

            lastScrollY = currentScrollY;
            isTicking = false;
        });

        isTicking = true;
    }
});

// Dropdown menu
(function (menuConfig) {
    /**
     * Merge default config with the theme overrided ones
     */
    var defaultConfig = {
        // behaviour
        mobileMenuMode: 'overlay',
        animationSpeed: 300,
        submenuWidth: 300,
        doubleClickTime: 500,
        mobileMenuExpandableSubmenus: false,
        isHoverMenu: true,
        // selectors
        wrapperSelector: '.navbar',
        buttonSelector: '.navbar__toggle',
        menuSelector: '.navbar__menu',
        submenuSelector: '.navbar__submenu',
        mobileMenuSidebarLogoSelector: null,
        mobileMenuSidebarLogoUrl: null,
        relatedContainerForOverlayMenuSelector: null,
        // attributes 
        ariaButtonAttribute: 'aria-haspopup',
        // CSS classes
        separatorItemClass: 'is-separator',
        parentItemClass: 'has-submenu',
        submenuLeftPositionClass: 'is-left-submenu',
        submenuRightPositionClass: 'is-right-submenu',
        mobileMenuOverlayClass: 'navbar_mobile_overlay',
        mobileMenuSubmenuWrapperClass: 'navbar__submenu_wrapper',
        mobileMenuSidebarClass: 'navbar_mobile_sidebar',
        mobileMenuSidebarOverlayClass: 'navbar_mobile_sidebar__overlay',
        hiddenElementClass: 'is-hidden',
        openedMenuClass: 'is-active',
        noScrollClass: 'no-scroll',
        relatedContainerForOverlayMenuClass: 'is-visible'
    };

    var config = {};

    Object.keys(defaultConfig).forEach(function (key) {
        config[key] = defaultConfig[key];
    });

    if (typeof menuConfig === 'object') {
        Object.keys(menuConfig).forEach(function (key) {
            config[key] = menuConfig[key];
        });
    }

    /**
     * Menu initializer
     */
    function init() {
        if (!document.querySelectorAll(config.wrapperSelector).length) {
            return;
        }

        initSubmenuPositions();

        if (config.mobileMenuMode === 'overlay') {
            initMobileMenuOverlay();
        } else if (config.mobileMenuMode === 'sidebar') {
            initMobileMenuSidebar();
        }

        initClosingMenuOnClickLink();

        if (!config.isHoverMenu) {
            initAriaAttributes();
        }
    };

    /**
     * Function responsible for the submenu positions
     */
    function initSubmenuPositions() {
        var submenuParents = document.querySelectorAll(config.wrapperSelector + ' .' + config.parentItemClass);

        for (var i = 0; i < submenuParents.length; i++) {
            var eventTrigger = config.isHoverMenu ? 'mouseenter' : 'click';

            submenuParents[i].addEventListener(eventTrigger, function () {
                var submenu = this.querySelector(config.submenuSelector);
                var itemPosition = this.getBoundingClientRect().left;
                var widthMultiplier = 2;

                if (this.parentNode === document.querySelector(config.menuSelector)) {
                    widthMultiplier = 1;
                }

                if (config.submenuWidth !== 'auto') {
                    var submenuPotentialPosition = itemPosition + (config.submenuWidth * widthMultiplier);

                    if (window.innerWidth < submenuPotentialPosition) {
                        submenu.classList.remove(config.submenuLeftPositionClass);
                        submenu.classList.add(config.submenuRightPositionClass);
                    } else {
                        submenu.classList.remove(config.submenuRightPositionClass);
                        submenu.classList.add(config.submenuLeftPositionClass);
                    }
                } else {
                    var submenuPotentialPosition = 0;
                    var submenuPosition = 0;

                    if (widthMultiplier === 1) {
                        submenuPotentialPosition = itemPosition + submenu.clientWidth;
                    } else {
                        submenuPotentialPosition = itemPosition + this.clientWidth + submenu.clientWidth;
                    }

                    if (window.innerWidth < submenuPotentialPosition) {
                        submenu.classList.remove(config.submenuLeftPositionClass);
                        submenu.classList.add(config.submenuRightPositionClass);
                        submenuPosition = -1 * submenu.clientWidth;
                        submenu.removeAttribute('style');

                        if (widthMultiplier === 1) {
                            submenuPosition = 0;
                            submenu.style.right = submenuPosition + 'px';
                        } else {
                            submenu.style.right = this.clientWidth + 'px';
                        }
                    } else {
                        submenu.classList.remove(config.submenuRightPositionClass);
                        submenu.classList.add(config.submenuLeftPositionClass);
                        submenuPosition = this.clientWidth;

                        if (widthMultiplier === 1) {
                            submenuPosition = 0;
                        }

                        submenu.removeAttribute('style');
                        submenu.style.left = submenuPosition + 'px';
                    }
                }

                submenu.setAttribute('aria-hidden', false);
            });

            if (config.isHoverMenu) {
                submenuParents[i].addEventListener('mouseleave', function () {
                    var submenu = this.querySelector(config.submenuSelector);
                    submenu.removeAttribute('style');
                    submenu.setAttribute('aria-hidden', true);
                });
            }
        }
    }

    /**
     * Function used to init mobile menu - overlay mode
     */
    function initMobileMenuOverlay() {
        var menuWrapper = document.createElement('div');
        menuWrapper.classList.add(config.mobileMenuOverlayClass);
        menuWrapper.classList.add(config.hiddenElementClass);
        var menuContentHTML = document.querySelector(config.menuSelector).outerHTML;
        menuWrapper.innerHTML = menuContentHTML;
        document.body.appendChild(menuWrapper);

        // Init toggle submenus
        if (config.mobileMenuExpandableSubmenus) {
            wrapSubmenusIntoContainer(menuWrapper);
            initToggleSubmenu(menuWrapper);
        } else {
            setAriaForSubmenus(menuWrapper);
        }

        // Init button events
        var button = document.querySelector(config.buttonSelector);

        button.addEventListener('click', function () {
            var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
            menuWrapper.classList.toggle(config.hiddenElementClass);
            button.classList.toggle(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));

            if (button.classList.contains(config.openedMenuClass)) {
                document.documentElement.classList.add(config.noScrollClass);

                if (relatedContainer) {
                    relatedContainer.classList.add(config.relatedContainerForOverlayMenuClass);
                }
            } else {
                document.documentElement.classList.remove(config.noScrollClass);

                if (relatedContainer) {
                    relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
                }
            }
        });
    }

    /**
     * Function used to init mobile menu - sidebar mode
     */
    function initMobileMenuSidebar() {
        // Create menu structure
        var menuWrapper = document.createElement('div');
        menuWrapper.classList.add(config.mobileMenuSidebarClass);
        menuWrapper.classList.add(config.hiddenElementClass);
        var menuContentHTML = '';

        if (config.mobileMenuSidebarLogoSelector !== null) {
            menuContentHTML = document.querySelector(config.mobileMenuSidebarLogoSelector).outerHTML;
        } else if (config.mobileMenuSidebarLogoUrl !== null) {
            menuContentHTML = '<img src="' + config.mobileMenuSidebarLogoUrl + '" alt="" />';
        }

        menuContentHTML += document.querySelector(config.menuSelector).outerHTML;
        menuWrapper.innerHTML = menuContentHTML;

        var menuOverlay = document.createElement('div');
        menuOverlay.classList.add(config.mobileMenuSidebarOverlayClass);
        menuOverlay.classList.add(config.hiddenElementClass);

        document.body.appendChild(menuOverlay);
        document.body.appendChild(menuWrapper);

        // Init toggle submenus
        if (config.mobileMenuExpandableSubmenus) {
            wrapSubmenusIntoContainer(menuWrapper);
            initToggleSubmenu(menuWrapper);
        } else {
            setAriaForSubmenus(menuWrapper);
        }

        // Menu events
        menuWrapper.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        menuOverlay.addEventListener('click', function () {
            menuWrapper.classList.add(config.hiddenElementClass);
            menuOverlay.classList.add(config.hiddenElementClass);
            button.classList.remove(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, false);
            document.documentElement.classList.remove(config.noScrollClass);
        });

        // Init button events
        var button = document.querySelector(config.buttonSelector);

        button.addEventListener('click', function () {
            menuWrapper.classList.toggle(config.hiddenElementClass);
            menuOverlay.classList.toggle(config.hiddenElementClass);
            button.classList.toggle(config.openedMenuClass);
            button.setAttribute(config.ariaButtonAttribute, button.classList.contains(config.openedMenuClass));
            document.documentElement.classList.toggle(config.noScrollClass);
        });
    }

    /**
     * Set aria-hidden="false" for submenus
     */
    function setAriaForSubmenus(menuWrapper) {
        var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

        for (var i = 0; i < submenus.length; i++) {
            submenus[i].setAttribute('aria-hidden', false);
        }
    }

    /**
     * Wrap all submenus into div wrappers
     */
    function wrapSubmenusIntoContainer(menuWrapper) {
        var submenus = menuWrapper.querySelectorAll(config.submenuSelector);

        for (var i = 0; i < submenus.length; i++) {
            var submenuWrapper = document.createElement('div');
            submenuWrapper.classList.add(config.mobileMenuSubmenuWrapperClass);
            submenus[i].parentNode.insertBefore(submenuWrapper, submenus[i]);
            submenuWrapper.appendChild(submenus[i]);
        }
    }

    /**
     * Initialize submenu toggle events
     */
    function initToggleSubmenu(menuWrapper) {
        // Init parent menu item events
        var parents = menuWrapper.querySelectorAll('.' + config.parentItemClass);

        for (var i = 0; i < parents.length; i++) {
            // Add toggle events
            parents[i].addEventListener('click', function (e) {
                e.stopPropagation();
                var submenu = this.querySelector('.' + config.mobileMenuSubmenuWrapperClass);
                var content = submenu.firstElementChild;

                if (submenu.classList.contains(config.openedMenuClass)) {
                    var height = content.clientHeight;
                    submenu.style.height = height + 'px';

                    setTimeout(function () {
                        submenu.style.height = '0px';
                    }, 0);

                    setTimeout(function () {
                        submenu.removeAttribute('style');
                        submenu.classList.remove(config.openedMenuClass);
                    }, config.animationSpeed);

                    content.setAttribute('aria-hidden', true);
                    content.parentNode.firstElementChild.setAttribute('aria-expanded', false);
                } else {
                    var height = content.clientHeight;
                    submenu.classList.add(config.openedMenuClass);
                    submenu.style.height = '0px';

                    setTimeout(function () {
                        submenu.style.height = height + 'px';
                    }, 0);

                    setTimeout(function () {
                        submenu.removeAttribute('style');
                    }, config.animationSpeed);

                    content.setAttribute('aria-hidden', false);
                    content.parentNode.firstElementChild.setAttribute('aria-expanded', true);
                }
            });

            // Block links
            var childNodes = parents[i].children;

            for (var j = 0; j < childNodes.length; j++) {
                if (childNodes[j].tagName === 'A') {
                    childNodes[j].addEventListener('click', function (e) {
                        var lastClick = parseInt(this.getAttribute('data-last-click'), 10);
                        var currentTime = +new Date();

                        if (isNaN(lastClick)) {
                            e.preventDefault();
                            this.setAttribute('data-last-click', currentTime);
                        } else if (lastClick + config.doubleClickTime <= currentTime) {
                            e.preventDefault();
                            this.setAttribute('data-last-click', currentTime);
                        } else if (lastClick + config.doubleClickTime > currentTime) {
                            e.stopPropagation();
                            closeMenu(this, true);
                        }
                    });
                }
            }
        }
    }

    /**
     * Set aria-* attributes according to the current activity state
     */
    function initAriaAttributes() {
        var allAriaElements = document.querySelectorAll(config.wrapperSelector + ' ' + '*[aria-hidden]');

        for (var i = 0; i < allAriaElements.length; i++) {
            var ariaElement = allAriaElements[i];

            if (
                ariaElement.parentNode.classList.contains('active') ||
                ariaElement.parentNode.classList.contains('active-parent')
            ) {
                ariaElement.setAttribute('aria-hidden', 'false');
                ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', true);
            } else {
                ariaElement.setAttribute('aria-hidden', 'true');
                ariaElement.parentNode.firstElementChild.setAttribute('aria-expanded', false);
            }
        }
    }

    /**
     * Close menu on click link
     */
    function initClosingMenuOnClickLink() {
        var links = document.querySelectorAll(config.menuSelector + ' a');

        for (var i = 0; i < links.length; i++) {
            if (links[i].parentNode.classList.contains(config.parentItemClass)) {
                continue;
            }

            links[i].addEventListener('click', function (e) {
                closeMenu(this, false);
            });
        }
    }

    /**
     * Close menu
     */
    function closeMenu(clickedLink, forceClose) {
        if (forceClose === false) {
            if (clickedLink.parentNode.classList.contains(config.parentItemClass)) {
                return;
            }
        }

        var relatedContainer = document.querySelector(config.relatedContainerForOverlayMenuSelector);
        var button = document.querySelector(config.buttonSelector);
        var menuWrapper = document.querySelector('.' + config.mobileMenuOverlayClass);

        if (!menuWrapper) {
            menuWrapper = document.querySelector('.' + config.mobileMenuSidebarClass);
        }

        menuWrapper.classList.add(config.hiddenElementClass);
        button.classList.remove(config.openedMenuClass);
        button.setAttribute(config.ariaButtonAttribute, false);
        document.documentElement.classList.remove(config.noScrollClass);

        if (relatedContainer) {
            relatedContainer.classList.remove(config.relatedContainerForOverlayMenuClass);
        }

        var menuOverlay = document.querySelector('.' + config.mobileMenuSidebarOverlayClass);

        if (menuOverlay) {
            menuOverlay.classList.add(config.hiddenElementClass);
        }
    }

    /**
     * Run menu scripts 
     */
    init();
})(window.publiiThemeMenuConfig);

// Load search input area
const searchButton = document.querySelector('.js-search-btn');
const searchOverlay = document.querySelector('.js-search-overlay');
const searchInput = document.querySelector('[type="search"]');

if (searchButton && searchOverlay) {
    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        searchOverlay.classList.toggle('expanded');

        if (searchInput) {
            setTimeout(() => {
                if (searchOverlay.classList.contains('expanded')) {
                    searchInput.focus();
                }
            }, 60);
        }
    });

    searchOverlay.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.body.addEventListener('click', () => {
        searchOverlay.classList.remove('expanded');
    });
}

// Share buttons pop-up
(function () {
    // share popup
    const shareButton = document.querySelector('.js-content__share-button');
    const sharePopup = document.querySelector('.js-content__share-popup');

    if (shareButton && sharePopup) {
        sharePopup.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        shareButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sharePopup.classList.toggle('is-visible');
        });

        document.body.addEventListener('click', function () {
            sharePopup.classList.remove('is-visible');
        });
    }

    // link selector and pop-up window size
    const Config = {
        Link: ".js-share",
        Width: 500,
        Height: 500
    };

    // add handler to links
    const shareLinks = document.querySelectorAll(Config.Link);
    shareLinks.forEach(link => {
        link.addEventListener('click', PopupHandler);
    });

    // create popup
    function PopupHandler(e) {
        e.preventDefault();

        const target = e.target.closest(Config.Link);
        if (!target) return;

        // hide share popup
        if (sharePopup) {
            sharePopup.classList.remove('is-visible');
        }

        // popup position
        const px = Math.floor((window.innerWidth - Config.Width) / 2);
        const py = Math.floor((window.innerHeight - Config.Height) / 2);

        // open popup
        const linkHref = target.href;
        const popup = window.open(linkHref, "social", `
            width=${Config.Width},
            height=${Config.Height},
            left=${px},
            top=${py},
            location=0,
            menubar=0,
            toolbar=0,
            status=0,
            scrollbars=1,
            resizable=1
        `);

        if (popup) {
            popup.focus();
        }
    }
})();

// Responsive embeds script
(function () {
    let wrappers = document.querySelectorAll('.post__video, .post__iframe');

    for (let i = 0; i < wrappers.length; i++) {
        let embed = wrappers[i].querySelector('iframe, embed, video, object');

        if (!embed) {
            continue;
        }

        if (embed.getAttribute('data-responsive') === 'false') {
            continue;
        }

        let w = embed.getAttribute('width');
        let h = embed.getAttribute('height');
        let ratio = false;

        if (!w || !h) {
            continue;
        }

        if (w.indexOf('%') > -1 && h.indexOf('%') > -1) { // percentage mode
            w = parseFloat(w.replace('%', ''));
            h = parseFloat(h.replace('%', ''));
            ratio = h / w;
        } else if (w.indexOf('%') === -1 && h.indexOf('%') === -1) { // pixels mode
            w = parseInt(w, 10);
            h = parseInt(h, 10);
            ratio = h / w;
        }

        if (ratio !== false) {
            let ratioValue = (ratio * 100) + '%';
            wrappers[i].setAttribute('style', '--embed-aspect-ratio:' + ratioValue);
        }
    }
})();

// Accordion
(function (accordionConfig) {
	/**
	 * Merge default config with the theme overrided ones
	 */
	var defaultConfig = {
		 // behaviour
		 animationSpeed: 300,
		 openOnlyOne: true,
		 openFirstItem: false,
		 // selectors
		 wrapperSelector: '.accordion',
		 titleSelector: 'h3',
		 contentSelector: 'div',
		 // CSS classes
		 contentWrapperClass: 'accordion-content-wrapper',
		 openedItemClass: 'is-open',
		 // Other
		 idFormat: 'faq{{index}}-{{subindex}}',
		 openViaURL: false
	};

	var config = {};

	Object.keys(defaultConfig).forEach(function(key) {
		 config[key] = defaultConfig[key];
	});

	if (typeof accordionConfig === 'object') {
		 Object.keys(accordionConfig).forEach(function(key) {
			  config[key] = accordionConfig[key];
		 });
	}

	/**
	 * Accordion initializer
	 */
	function init () {
		 var accordions = document.querySelectorAll(config.wrapperSelector);
		 
		 if (!accordions.length) {
			  return;
		 }

		 for (var i = 0; i < accordions.length; i++) {
			  initAccordion(accordions[i], i);
		 }
	}

	/**
	 * Initialize a specific accordion
	 */
	function initAccordion (wrapper, index) {
		 var allDirectChildElements = wrapper.children;
		 var titles = [];
		 var contents = [];

		 for (var i = 0; i < allDirectChildElements.length; i++) {
			  if (allDirectChildElements[i].matches(config.titleSelector)) {
					titles.push(allDirectChildElements[i]);
			  } else if (allDirectChildElements[i].matches(config.contentSelector)) {
					contents.push(allDirectChildElements[i]);
			  }
		 }

		 if (!titles.length && !contents.length) {
			  for (var i = 0; i < allDirectChildElements.length; i++) {
					for (var j = 0; j < allDirectChildElements[i].children.length; j++) {
						 if (allDirectChildElements[i].children[j].matches(config.titleSelector)) {
							  titles.push(allDirectChildElements[i].children[j]);
						 } else if (allDirectChildElements[i].children[j].matches(config.contentSelector)) {
							  contents.push(allDirectChildElements[i].children[j]);
						 }
					}  
			  } 
		 }

		 for (var j = 0; j < titles.length; j++) {
			  titles[j].setAttribute('data-index', j);
			  titles[j].addEventListener('click', function (e) {
					e.preventDefault();
					var index = parseInt(e.target.getAttribute('data-index'), 10);

					if (e.target.classList.contains(config.openedItemClass)) {
						 closeItem(titles, contents, index, true);
					} else {
						 if ((config.openOnlyOne || wrapper.getAttribute('data-open-only-one') === 'true') && wrapper.getAttribute('data-open-only-one') !== 'false') {
							  closeAllItems(titles, contents, index);
						 }

						 openItem(titles, contents, index, true);
					}
			  });
		 }

		 for (var k = 0; k < contents.length; k++) {
			  contents[k].setAttribute('data-index', k);
			  contents[k].innerHTML = '<div class="' + config.contentWrapperClass + '">' + contents[k].innerHTML + '</div>';
		 }

		 addIdAttributes(index, titles, contents);
		 initARIA(titles);

		 if (hasItemToOpenViaURL(wrapper)) {
			  var titleToOpen = document.querySelector('*[aria-controls="' + window.location.hash.replace('#', '') + '"]');
			  var indexOfTitleToOpen = parseInt(titleToOpen.getAttribute('data-index'), 10);
			  openItem(titles, contents, indexOfTitleToOpen);
		 } else if ((config.openFirstItem || wrapper.getAttribute('data-open-first-item') === 'true') && wrapper.getAttribute('data-open-first-item') !== 'false') {
			  openItem(titles, contents, 0);
		 }
	}

	/**
	 * Check if there is an item to open from URL
	 */
	function hasItemToOpenViaURL (wrapper) {
		 if (!config.openViaURL) {
			  return false;
		 }

		 if (window.location.hash.length <= 1) {
			  return false;
		 }
		 
		 if (!document.querySelector(window.location.hash)) {
			  return false;
		 }

		 if (!wrapper.querySelector(window.location.hash)) {
			  return false;
		 }

		 return true;
	}

	/**
	 * Open specific item
	 */
	function openItem (titles, contents, index, updateHistory = false) {
		 titles[index].classList.add(config.openedItemClass);
		 titles[index].setAttribute('aria-expanded', 'true');
		 contents[index].classList.add(config.openedItemClass);
		 contents[index].style.height = '0px';
		 var contentWrapper = contents[index].querySelector('.' + config.contentWrapperClass);
		 var contentHeight = contentWrapper.getBoundingClientRect().height;

		 if (updateHistory) {
			  history.pushState({}, null, '#' + titles[index].getAttribute('aria-controls'));
		 }
		 
		 setTimeout(function () {
			  contents[index].style.height = contentHeight + 'px';

			  setTimeout(function () {
					if (titles[index].getAttribute('aria-expanded') === 'true') {
						 contents[index].style.height = 'auto';
					}
			  }, config.animationSpeed);
		 }, 0);
	}

	/**
	 * Close specific item
	 */
	function closeItem (titles, contents, index, updateHistory = false) {
		 titles[index].classList.remove(config.openedItemClass);
		 titles[index].setAttribute('aria-expanded', 'false');
		 contents[index].classList.remove(config.openedItemClass);
		 var contentWrapper = contents[index].querySelector('.' + config.contentWrapperClass);
		 var contentHeight = contentWrapper.getBoundingClientRect().height;
		 contents[index].style.height = contentHeight + 'px';

		 if (updateHistory) {
			  history.replaceState(null, null, ' ');
		 }

		 setTimeout(function () {
			  contents[index].style.height = '0px';
		 }, 25);
	}

	/**
	 * Close all items excluding the specified one
	 */
	function closeAllItems (titles, contents, indexToSkip) {
		 for (var i = 0; i < titles.length; i++) {
			  if (i !== indexToSkip && titles[i].classList.contains(config.openedItemClass)) {
					closeItem(titles, contents, i);
			  }
		 }
	}

	/**
	 * Add automatically generated ID attributes to the contents
	 */
	function addIdAttributes (index, titles, contents) {
		 for (var i = 0; i < contents.length; i++) {
			  if (!contents[i].getAttribute('id')) {
					var contentID = config.idFormat.replace('{{index}}', index + 1).replace('{{subindex}}', i + 1);
					contents[i].setAttribute('id', contentID);
					titles[i].setAttribute('aria-controls', contentID);
			  }
		 }
	}

	/**
	 * Initialize ARIA attributes for toggle elements
	 */
	function initARIA (titles) {
		 for (var i = 0; i < titles.length; i++) {
			  titles[i].setAttribute('aria-expanded', 'false');
		 }
	}

	/**
	 * Run accordion scripts 
	 */
	init();
})(window.publiiThemeAccordionConfig);


// Back to top
document.addEventListener('DOMContentLoaded', () => {
	const backToTopButton = document.getElementById('backToTop');

	if (backToTopButton) {
		 const backToTopScrollFunction = () => {
			  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
					backToTopButton.classList.add('is-visible');
			  } else {
					backToTopButton.classList.remove('is-visible');
			  }
		 };

		 const backToTopFunction = () => {
			  window.scrollTo({
					top: 0,
					behavior: 'smooth'
			  });
		 };

		 window.addEventListener('scroll', backToTopScrollFunction);
		 backToTopButton.addEventListener('click', backToTopFunction);
	}
});