(function () {
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();

  var gridEl = document.getElementById('cal-grid');
  var labelEl = document.getElementById('cal-month-label');
  var hintEl = document.getElementById('cal-hint');
  var prevBtn = document.getElementById('cal-prev');
  var nextBtn = document.getElementById('cal-next');
  var todayBtn = document.getElementById('cal-today');

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDate(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  function render() {
    labelEl.textContent = MONTHS[viewMonth] + ' ' + viewYear;
    hintEl.textContent = 'Loading…';
    gridEl.innerHTML = '';

    var firstDow = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    var daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    var totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

    var cells = [];
    for (var i = 0; i < totalCells; i++) {
      var dayNum = i - firstDow + 1;
      var cellDate, outside = false;
      if (dayNum < 1) {
        cellDate = new Date(viewYear, viewMonth - 1, daysInPrevMonth + dayNum);
        outside = true;
      } else if (dayNum > daysInMonth) {
        cellDate = new Date(viewYear, viewMonth + 1, dayNum - daysInMonth);
        outside = true;
      } else {
        cellDate = new Date(viewYear, viewMonth, dayNum);
      }
      cellDate.setHours(0, 0, 0, 0);
      var iso = isoDate(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
      cells.push({
        iso: iso,
        dayNum: cellDate.getDate(),
        dow: DOW[cellDate.getDay()],
        outside: outside,
        isToday: cellDate.getTime() === today.getTime(),
      });
    }

    gridEl.innerHTML = cells.map(function (c) {
      return '<div class="cal-day' + (c.outside ? ' is-outside' : '') + (c.isToday ? ' is-today' : '') + '">' +
        '<span class="cal-daynum"><span class="cal-day-dow">' + c.dow + '</span> ' + c.dayNum + '</span>' +
        '<div class="cal-events" data-date="' + c.iso + '"></div>' +
        '</div>';
    }).join('');

    var firstIso = cells[0].iso;
    var last = cells[cells.length - 1];
    var timeMin = new Date(firstIso + 'T00:00:00').toISOString();
    var lastCellDate = new Date(last.iso + 'T00:00:00');
    lastCellDate.setDate(lastCellDate.getDate() + 1);
    var timeMax = lastCellDate.toISOString();

    var requestId = viewYear + '-' + viewMonth;
    render.currentRequest = requestId;

    fetch('/api/events?timeMin=' + encodeURIComponent(timeMin) + '&timeMax=' + encodeURIComponent(timeMax) + '&maxResults=200')
      .then(function (res) { return res.json(); })
      .then(function (events) {
        if (render.currentRequest !== requestId) return;
        if (!events || !events.length) {
          hintEl.textContent = 'No events found for ' + MONTHS[viewMonth] + ' ' + viewYear + '.';
          return;
        }
        hintEl.textContent = '';
        events.forEach(function (e) {
          var slot = gridEl.querySelector('.cal-events[data-date="' + e.date + '"]');
          if (!slot) return;
          var chip = document.createElement('div');
          chip.className = 'cal-event';
          var title = document.createElement('span');
          title.className = 'cal-event-title';
          title.textContent = e.title;
          chip.appendChild(title);
          if (e.details) {
            var details = document.createElement('span');
            details.className = 'cal-event-details';
            details.textContent = e.details;
            chip.appendChild(details);
          }
          slot.appendChild(chip);
        });
      })
      .catch(function () {
        if (render.currentRequest !== requestId) return;
        hintEl.textContent = 'Could not load events right now — please try again shortly.';
      });
  }

  prevBtn.addEventListener('click', function () {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });
  nextBtn.addEventListener('click', function () {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });
  todayBtn.addEventListener('click', function () {
    viewYear = today.getFullYear();
    viewMonth = today.getMonth();
    render();
  });

  render();
})();
