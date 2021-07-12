import {
  Observable,
  of,
  from,
  fromEvent,
  timer,
  interval,
  forkJoin,
  combineLatest,
  EMPTY
} from 'rxjs';
import {
  filter,
  map,
  tap,
  debounceTime,
  catchError,
  concatMap
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

/**
 * Pipeable Operators
 * 1. filter
 * 2. map
 * 3. tap
 * 4. debounceTime
 * 5. catchError
 * 6. concatMap/switchMap/mergeMap/exhaustMap
 *
 **/
// 6. ***  FLATENING OPERATOR ***

// concatMap - is basically chaining one observable to another observable created
// inside concatMap function. Queue the values coming from the source Observable
// and handled each one of them one by one. 
// * Has queue and buffer - will queue incoming value
// * Memory leaks easy to notice
// * Values hadled one by one
// * Slow and ineffecient in some scenario

// switchMap - If an outer observable emitted a new value switchMap will cancel or unsubscribe the previous inner
// observable and immediately creates and switch to a new one. Good for database queries that you only care 
// about is the response
// * Cancel and unsubscribe the previous inner subscription, will not care about the result.
// * Memory leak not dangerous because of unsubscribing of the previous inner observable. 
// * Only one inner subscription at a time
// * Quick reaction to new source value.
// * Order mostly safe
// * Not ideal for saving in state. Good for reading from database

// mergeMap - emits the values to the output whenever any of it's inner concurrent 
// subscriptions receives some value. Order of the processing is not guaranteed.
// * Concurrent
// * Memory leaks may bound to happen
// * No definite order

// concatMap / Static Example
/*const source$ = new Observable(subscriber => {
  setTimeout(() => subscriber.next('A'), 2000);
  setTimeout(() => subscriber.next('B'), 5000);
});

console.log('App has started');
source$
  .pipe(concatMap(value => of(1, 2)))
  .subscribe(value => console.log(value));*/

// concatMap / HTTP Request Example with Results
const endpointInput: HTMLInputElement = document.querySelector('#endpoint');
const fetchButton = document.querySelector('#fetch');

/*fromEvent(fetchButton, 'click')
  .pipe(
    map(() => endpointInput.value),
    concatMap(value =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`)
        .pipe(
          map(result => result.response['description'])
        )
    )
  )
  .subscribe(value => console.log(value));*/

// concatMap / HTTP Request Example with Error (Handling Error First Solution)
// Note: error inside the concatMap observable will complete the outer observable,
// hence next click on fetch button will not work anymore. This is true
// to all flatening operators (switchMap, mergeMap)
/*fromEvent(fetchButton, 'click')
  .pipe(
    map(() => endpointInput.value),
    concatMap(value =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`)
        .pipe(
          map(result => result.response['description'])
        )
    ),
    // catchError in outer observable will complete everythingg 
    // and fromEvent will not work anymore
    catchError(() => EMPTY) 
  )
  .subscribe({
    next: value => console.log(value),
    error: err => console.log('Error:', err),
    complete: () => console.log('Completed')
  });*/

// concatMap / HTTP Request Example with Error (Handling Error Second Solution)
// Note: concatMap waits previous inner subscription to finish before started a new one
// this ensures the ordering of the processing of the emitted value of the outer observable.
// Guarantess values is being handled one after another.
/*fromEvent(fetchButton, 'click')
  .pipe(
    map(() => endpointInput.value),
    concatMap(value =>
      ajax(`https://random-data-api.com/api/${value}/random_${value}`)
      .pipe(
        map(result => result.response['description']),
        // catchError in inner observable will not complete the outer observable
        catchError(error => of(`Could not fetch data: ${error}`)) 
        //catchError(error => EMPTY) 
      )
    )
  )
  .subscribe({
    next: value => console.log(value),
    error: err => console.log('Error:', err),
    complete: () => console.log('Completed')
  });*/


// 5 catchError
// EMPTY don't provide value and complete the observable right away.
/*const failingHttpRequest$ = new Observable(subscriber => {
  setTimeout(() => {
    subscriber.error(new Error('Timeout'));
  }, 3000);
});

console.log('App started');

failingHttpRequest$.pipe(catchError(error => EMPTY)).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});*/

// 4. debounceTime
/*const sliderInput = document.querySelector('#slider');

fromEvent(sliderInput, 'input')
  .pipe(
    debounceTime(1000),
    map(event => event.target.value)
  )
  .subscribe(value => {
    console.log(value);
  });*/

// 3. tap
/*of(1, 7, 3, 6, 2)
  .pipe(
    filter(value => value > 5),
    tap(value => console.log('Tap: ', value)),
    map(value => value * 2)
  )
  .subscribe(value => console.log(value));
//or
of(1, 7, 3, 6, 2)
  .pipe(
    filter(value => value > 5),
    tap({
      next: value => console.log('Tap: ', value),
      error: err => console.log('Tap Error: ', err)
    }),
    map(value => value * 2)
  )
  .subscribe(value => console.log(value));*/

// 2. map
/*const fjAjax1$ = ajax<any>(
  'https://random-data-api.com/api/users/random_user'
).pipe(map(result => result.response.first_name));
const fjAjax2$ = ajax<any>(
  'https://random-data-api.com/api/vehicle/random_vehicle'
).pipe(map(result => result.response.car_type));
const fjAjax3$ = ajax<any>(
  'https://random-data-api.com/api/nation/random_nation'
).pipe(map(result => result.response.capital));

forkJoin([fjAjax1$, fjAjax2$, fjAjax3$]).subscribe(
  ([name, vehicle, nation]) => {
    console.log(`${name} that drives ${vehicle} lives in ${nation}`);
  }
);*/

// 1. filter
/*interface NewsItem {
  category: 'Business' | 'Sports';
  content: string;
}

const newsfeed$ = new Observable<NewsItem>(subscriber => {
  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'A' });
  }, 1000);
  setTimeout(() => {
    subscriber.next({ category: 'Sports', content: 'B' });
  }, 3000);
  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'C' });
  }, 4000);
  setTimeout(() => {
    subscriber.next({ category: 'Sports', content: 'D' });
  }, 6000);
  setTimeout(() => {
    subscriber.next({ category: 'Business', content: 'E' });
  }, 7000);
});
newsfeed$.pipe(filter(item => item.category === 'Sports')).subscribe(item => {
  console.log(item);
});*/

/**
 * Creation Function (creates Obsevable)
 * 1. of
 * 2. from
 * 3. fromEvent
 * 4. interval/timer
 * 5. forkJoin
 * 6. combineLatest
 */
// 6. combineLatest
// This keep emitting the latest set of values each time the provided input Observable emmitted something new.
const textInput = document.getElementById('text-input');
const selectInput = document.getElementById('select-input');
const resultText = document.getElementById('result-text');

const textInputEvent$ = fromEvent(textInput, 'input');
const selectInputEvent$ = fromEvent(selectInput, 'input');

combineLatest([textInputEvent$, selectInputEvent$]).subscribe(
  ([textInputEvent, selectInputEvent]) => {
    console.log('inside combineLatest: ');
    const temp = textInputEvent.target.value;
    const conversion = selectInputEvent.target.value;

    let result: number;
    if (conversion === 'FtoC') {
      result = ((temp - 32) * 5) / 9;
    } else if (conversion === 'CtoF') {
      result = (temp * 9) / 5 + 32;
    }
    resultText.innerText = String(result);
  }
);

// 5. forkJoin
// Wait for all Observable to complete before emitting the set of values
// Good for multiple HTTP calls

/*const fjAjax1$ = ajax<any>('https://random-data-api.com/api/users/random_user');
const fjAjax2$ = ajax<any>(
  'https://random-data-api.com/api/vehicle/random_vehicle'
);
const fjAjax3$ = ajax<any>(
  'https://random-data-api.com/api/nation/random_nation'
);*/

/*
const name$ = fjAjax1$.subscribe(result =>
  console.log(result.response.first_name)
);
const vehicle$ = fjAjax2$.subscribe(result =>
  console.log(result.response.car_type)
);
const nation$ = fjAjax3$.subscribe(result =>
  console.log(result.response.capital)
);
*/

/*forkJoin([fjAjax1$, fjAjax2$, fjAjax3$]).subscribe(([name, vehicle, nation]) => {
  console.log(
    `${name.response.first_name} that drives ${
      vehicle.response.car_type
    } lives in ${nation.response.capital}`
  );
});*/

// forkJoin with Error.
// If error occurs  on other observable besides the first one it will execute teardown of the first observable // in the forkJoin first
/*const a$ = new Observable(subscriber => {
  setTimeout(() => {
    subscriber.next('A');
    subscriber.complete();
  }, 3000);

  return () => {
    console.log('A teardown');
  };
});

const b$ = new Observable(subscriber => {
  setTimeout(() => {
    subscriber.error('Failure');
  }, 5000);
  return () => {
    console.log('B teardown');
  };
});

forkJoin([a$, b$]).subscribe({
  next: ([a, b]) => console.log(a, b),
  error: err => console.log('Error: ', err)
});8?

// 4. timer / interval
// interval
//console.log('Interval started');
/*const intsubs = interval(1000).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});
setTimeout(() => {
  intsubs.unsubscribe();
  console.log('Unsubscribing');
}, 5000);*/

//same as
/*const interval$ = new Observable<number>(subscriber => {
  let counter = 0;
  const interval = setInterval(() => {
    console.log('Timeout');
    subscriber.next(counter++);
    //subscriber.complete();
  }, 1000);

  return () => clearInterval(interval);
});

const intsubs2 = interval$.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});
setTimeout(() => {
  intsubs2.unsubscribe();
  console.log('Unsubscribing');
}, 1000);*/

// timer
//console.log('Timer started');
/*const subs = timer(2000).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});
setTimeout(() => {
  subs.unsubscribe();
}, 1000);*/

//same as
/*const timer$ = new Observable<number>(subscriber => {
  const timeout = setTimeout(() => {
    console.log('Timeout');
    subscriber.next(0);
    subscriber.complete();
  }, 2000);

  return () => {
    clearTimeout(timeout);
  };
});
const subs2 = timer$.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});
setTimeout(() => {
  subs2.unsubscribe();
  console.log('Unsubscribing');
}, 1000);*/

// 3. fromEvent
//const btnHello = document.querySelector('#hello');

/*const subs = fromEvent<MouseEvent>(btnHello, 'click').subscribe(event => {
  console.log('Sub 1: ', event.type, event.x, event.y);
});

setTimeout(() => {
  console.log('Unsubscribe');
  subs.unsubscribe();
}, 5000);*/

// same as
/*const bntClick$ = new Observable(subscriber => {
  const clickEvent = event => {
    console.log('Event click');
    subscriber.next(event);
  };
  btnHello.addEventListener('click', clickEvent);

  return () => {
    btnHello.removeEventListener('click', clickEvent);
  };
});
const subs2 = bntClick$.subscribe(event =>
  console.log('Sub 1: ', event.type, event.x, event.y)
);
setTimeout(() => {
  console.log('Unsubscribe');
  subs2.unsubscribe();
}, 5000);*/

// 2. from
/*from(['Tatay', 'Tovi', 'Nanay']).subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});*/

/*const thePromise = new Promise((resolve, reject) => {
  //resolve('resolved');
  reject('rejected');
});
const thePromise$ = from(thePromise);

thePromise$.subscribe({
  next: value => console.log(value),
  error: err => console.log('Error: ', err),
  complete: () => console.log('Completed')
});*/

//1. of
/*of('Tatay', 'Tovi', 'Nanay').subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});*/
// same as
/*const names$ = new Observable<string>(subscriber => {
  subscriber.next('Zorlac');
  subscriber.next('Tovi');
  subscriber.next('Nanay');
  subscriber.complete();
});

names$.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});

customOf('Tatay', 'Tovi', 'Nanay').subscribe({
  next: value => console.log(value),
  complete: () => console.log('Completed')
});

function customOf(...args: string[]): Observable<string> {
  return new Observable<string>(subscriber => {
    for (let i = 0; i < args.length; i++) {
      subscriber.next(args[i]);
    }
    subscriber.complete();
  });
}*/

/** Hot Observable **/
/*
const btnHello = document.querySelector('#hello');

const btnClicks$ = new Observable<MouseEvent>(subscriber => {
  btnHello.addEventListener('click', event => {
    subscriber.next(event);
  });
});

const btnSubs = btnClicks$.subscribe(event => {
  console.log('Sub 1: ', event.type, event.x, event.y);
});

setTimeout(() => {
  console.log('Subscription 2 starts');
  const btnSubs2 = btnClicks$.subscribe(event => {
    console.log('Sub 2: ', event.type, event.x, event.y);
  });
}, 5000);
*/

/** Cold Observable **/
/*
const ajax$ = ajax<any>('https://random-data-api.com/api/users/random_user');

ajax$.subscribe ( {
  next: data => console.log('Sub 1: ', data.response.first_name)
});

ajax$.subscribe (
  data => console.log('Sub 2: ', data.response.first_name)
);


ajax$.subscribe ( {
  next: data => console.log('Sub 3: ', data.response.first_name)
});
*/
/*
const observable$ = new Observable<string>(subscriber => {
  let counter = 1;
  const interval = setInterval(() => {
    console.log('Emmitting: ' + counter);
    subscriber.next(counter++);
  }, 2000);

  return () => {
    console.log('Teardown');
    clearInterval(interval);
  };
});

const subs = observable$.subscribe(value => {
  console.log(value);
});

setTimeout(() => {
  console.log('umsubscribing');
  subs.unsubscribe();
}, 7000);

*/

/*
const observable$ = new Observable<string>(subscriber => {
  console.log('Running observable....');
  subscriber.next('Zorlac2');
  subscriber.next('Tovi');
  setTimeout(() => {
    //subscriber.error(new Error('Failure'));
  }, 2000);
  setTimeout(() => {
    subscriber.next('Nanay');
    //subscriber.complete();
  }, 5000);

  return () => {
    console.log('Teardown');
  };
});

console.log('Bedore subs1');
const subs1 = observable$.subscribe({
  next: value => console.log('subs1: ' + value),
  complete: () => console.log('completed')
});
console.log('After subs1');

setTimeout(() => {
  console.log('unsubuscribing');
  subs1.unsubscribe();
}, 4000);
*/
