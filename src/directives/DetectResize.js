import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import ResizeObserver from "resize-observer-polyfill";


const subs = new WeakMap();

const ResizeObserver$ = el => {

    return Observable.create(o => {

        const ro = new ResizeObserver(entries => {
            if (!subs.has(el)) {
                o.complete();
                return;
            }
            entries.forEach(entry => o.next(entry));
        });

        ro.observe(el);

        return function() {
            ro.disconnect();
        }
    })
}

function initObserver(el, binding) {
    if (subs.has(el)) return;

    const callback = binding.value;
    if (!(callback instanceof Function)) {
        throw new Error("Callback should be a function in DetectResize");
    }

    const debounceDelay = parseInt(binding.arg || 0);
    const resize$ = ResizeObserver$(el).pipe(
        debounceTime(debounceDelay),
        distinctUntilChanged()
    );

    const sub = resize$.subscribe(callback);

    subs.set(el, sub);
}

function tearDown(el) {
    if (!subs.has(el)) return;
    subs.get(el).unsubscribe();
    subs.delete(el);
}

// function refresh(el, binding) {
//     if (binding.value !== binding.oldValue) {
//         tearDown(el);
//         initObserver(el, binding);
//     }
// }

export default {
    bind: initObserver,
    unbind: tearDown,
    // update: refresh,
    // componentUpdated: refresh
}