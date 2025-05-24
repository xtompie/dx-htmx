const hx = (() => {

    const main = (source, event = null) => {
        preventDefault(source, event);

        if (isDisabled(source)) return;

        markDisabled(source);

        const job = createJob(source);
        if (!job) {
            unmarkDisabled(source);
            return;
        }

        show(job.indicator);

        fetch(job.url, job.options)
            .then(res => res.text())
            .then(html => render(html, job))
            .finally(() => {
                hide(job.indicator);
                unmarkDisabled(source);
            });
    };

    const preventDefault = (el, event) => {
        if ((el.tagName === 'FORM' || el.tagName === 'A') && event?.preventDefault) {
            event.preventDefault();
        }
    };

    const isDisabled = el => el.hasAttribute('hx-disabled');

    const markDisabled = el => {
        if (el.hasAttribute('hx-disable') || el.hasAttribute('hx-disable-this')) {
            el.setAttribute('hx-disabled', '');
            el.disabled = true;
            el.classList.add('hx-disabled');
        }
        const selector = el.getAttribute('hx-disabled-elt');
        const target = findTarget(el, selector);
        if (target) {
            target.setAttribute('hx-disabled', '');
            target.disabled = true;
            target.classList.add('hx-disabled');
        }
    };

    const unmarkDisabled = el => {
        if (el.hasAttribute('hx-disable') || el.hasAttribute('hx-disable-this')) {
            el.removeAttribute('hx-disabled');
            el.disabled = false;
            el.classList.remove('hx-disabled');
        }
        const selector = el.getAttribute('hx-disabled-elt');
        const target = findTarget(el, selector);
        if (target) {
            target.removeAttribute('hx-disabled');
            target.disabled = false;
            target.classList.remove('hx-disabled');
        }
    };

    const createJob = el => {
        const method = resolveMethod(el);
        const url = resolveUrl(el, method);
        const target = findTarget(el, attr(el, 'hx-target'));
        if (!method || !url || !target) return null;

        const body = buildBody(el, method);
        const options = buildOptions(method, body);
        const swap = attr(el, 'hx-swap') || 'innerHTML';
        const selector = attr(el, 'hx-select');
        const indicator = findIndicator(el);

        return { method, url, options, swap, selector, target, indicator };
    };

    const resolveMethod = el => {
        const names = ['get', 'post', 'put', 'delete', 'patch'];
        for (const name of names) {
            const url = attr(el, `hx-${name}`);
            if (url) return name.toUpperCase();
        }
        if (el.tagName === 'A' && el.hasAttribute('href')) return 'GET';
        return 'POST';
    };

    const resolveUrl = (el, method) => {
        const names = ['get', 'post', 'put', 'delete', 'patch'];
        for (const name of names) {
            const url = attr(el, `hx-${name}`);
            if (url) return url;
        }
        if (el.tagName === 'A' && el.hasAttribute('href')) return el.getAttribute('href');
        if (el.tagName === 'FORM' && el.hasAttribute('action')) return el.getAttribute('action');
        if (el.tagName === 'FORM') return location.href;
        return null;
    };

    const buildBody = (el, method) => {
        if (method === 'GET') return null;
        if (el.tagName === 'FORM') return new URLSearchParams(new FormData(el)).toString();
        if (!el.name) return null;
        return `${encodeURIComponent(el.name)}=${encodeURIComponent(el.value || '')}`;
    };

    const buildOptions = (method, body) => {
        if (method === 'GET') return { method };
        return {
            method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
        };
    };

    const attr = (el, name) => el.closest(`[${name}]`)?.getAttribute(name) || null;

    const findTarget = (el, descriptor) => {
        if (!descriptor) return el; // Domyślny target to source
        if (descriptor.startsWith('closest ')) {
            const parts = descriptor.split(' ');
            const base = el.closest(parts[1]);
            const sub = parts.slice(2).join(' ');
            return base && sub ? base.querySelector(sub) : base;
        }
        return document.querySelector(descriptor);
    };

    const findIndicator = el => {
        const selector = attr(el, 'hx-indicator');
        return selector && document.querySelector(selector);
    };

    const show = el => {
        if (el) el.style.display = '';
    };

    const hide = el => {
        if (el) el.style.display = 'none';
    };

    const render = (html, job) => {
        const frag = document.createElement('template');
        frag.innerHTML = html.trim();
        const content = job.selector ? frag.content.querySelector(job.selector) : frag.content;
        if (!content) return;

        if (job.swap === 'outerHTML') {
            job.target.outerHTML = content.firstElementChild?.outerHTML || '';
        } else if (job.swap === 'append') {
            job.target.append(...content.children);
        } else if (job.swap === 'prepend') {
            job.target.prepend(...Array.from(content.children).reverse());
        } else if (job.swap === 'none') {
            return;
        } else {
            job.target.innerHTML = '';
            job.target.append(...content.children);
        }
    };

    return main;
})();
