"use strict";

/*
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 12 2019
 *
 */

/* global PbxApi, globalDebugMode */
var connectionCheckWorker = {
  timeOut: 1000,
  timeOutHandle: '',
  errorCounts: 0,
  $connectionDimmer: $('#connection-dimmer'),
  initialize: function () {
    function initialize() {
      // Запустим обновление статуса провайдера
      connectionCheckWorker.restartWorker();
    }

    return initialize;
  }(),
  restartWorker: function () {
    function restartWorker() {
      window.clearTimeout(connectionCheckWorker.timeoutHandle);
      connectionCheckWorker.worker();
    }

    return restartWorker;
  }(),
  worker: function () {
    function worker() {
      PbxApi.PingPBX(connectionCheckWorker.cbAfterResponse);
      connectionCheckWorker.timeoutHandle = window.setTimeout(connectionCheckWorker.worker, connectionCheckWorker.timeOut);
    }

    return worker;
  }(),
  cbAfterResponse: function () {
    function cbAfterResponse(result) {
      if (result === true) {
        connectionCheckWorker.$connectionDimmer.dimmer('hide');
        connectionCheckWorker.timeOut = 3000;
        if (connectionCheckWorker.errorCounts > 5) window.location.reload();
        connectionCheckWorker.errorCounts = 0;
      } else if (connectionCheckWorker.errorCounts > 3) {
        connectionCheckWorker.$connectionDimmer.dimmer('show');
        connectionCheckWorker.timeOut = 1000;
        connectionCheckWorker.errorCounts += 1;
      } else {
        connectionCheckWorker.timeOut = 1000;
        connectionCheckWorker.errorCounts += 1;
      }
    }

    return cbAfterResponse;
  }()
};
$(document).ready(function () {
  if (!globalDebugMode) {
    connectionCheckWorker.initialize();
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluL2Nvbm5lY3Rpb24tY2hlY2std29ya2VyLmpzIl0sIm5hbWVzIjpbImNvbm5lY3Rpb25DaGVja1dvcmtlciIsInRpbWVPdXQiLCJ0aW1lT3V0SGFuZGxlIiwiZXJyb3JDb3VudHMiLCIkY29ubmVjdGlvbkRpbW1lciIsIiQiLCJpbml0aWFsaXplIiwicmVzdGFydFdvcmtlciIsIndpbmRvdyIsImNsZWFyVGltZW91dCIsInRpbWVvdXRIYW5kbGUiLCJ3b3JrZXIiLCJQYnhBcGkiLCJQaW5nUEJYIiwiY2JBZnRlclJlc3BvbnNlIiwic2V0VGltZW91dCIsInJlc3VsdCIsImRpbW1lciIsImxvY2F0aW9uIiwicmVsb2FkIiwiZG9jdW1lbnQiLCJyZWFkeSIsImdsb2JhbERlYnVnTW9kZSJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7QUFRQTtBQUVBLElBQU1BLHFCQUFxQixHQUFHO0FBQzdCQyxFQUFBQSxPQUFPLEVBQUUsSUFEb0I7QUFFN0JDLEVBQUFBLGFBQWEsRUFBRSxFQUZjO0FBRzdCQyxFQUFBQSxXQUFXLEVBQUUsQ0FIZ0I7QUFJN0JDLEVBQUFBLGlCQUFpQixFQUFFQyxDQUFDLENBQUMsb0JBQUQsQ0FKUztBQUs3QkMsRUFBQUEsVUFMNkI7QUFBQSwwQkFLaEI7QUFDWjtBQUNBTixNQUFBQSxxQkFBcUIsQ0FBQ08sYUFBdEI7QUFDQTs7QUFSNEI7QUFBQTtBQVM3QkEsRUFBQUEsYUFUNkI7QUFBQSw2QkFTYjtBQUNmQyxNQUFBQSxNQUFNLENBQUNDLFlBQVAsQ0FBb0JULHFCQUFxQixDQUFDVSxhQUExQztBQUNBVixNQUFBQSxxQkFBcUIsQ0FBQ1csTUFBdEI7QUFDQTs7QUFaNEI7QUFBQTtBQWE3QkEsRUFBQUEsTUFiNkI7QUFBQSxzQkFhcEI7QUFDUkMsTUFBQUEsTUFBTSxDQUFDQyxPQUFQLENBQWViLHFCQUFxQixDQUFDYyxlQUFyQztBQUNBZCxNQUFBQSxxQkFBcUIsQ0FBQ1UsYUFBdEIsR0FBc0NGLE1BQU0sQ0FBQ08sVUFBUCxDQUNyQ2YscUJBQXFCLENBQUNXLE1BRGUsRUFFckNYLHFCQUFxQixDQUFDQyxPQUZlLENBQXRDO0FBSUE7O0FBbkI0QjtBQUFBO0FBb0I3QmEsRUFBQUEsZUFwQjZCO0FBQUEsNkJBb0JiRSxNQXBCYSxFQW9CTDtBQUN2QixVQUFJQSxNQUFNLEtBQUssSUFBZixFQUFxQjtBQUNwQmhCLFFBQUFBLHFCQUFxQixDQUFDSSxpQkFBdEIsQ0FBd0NhLE1BQXhDLENBQStDLE1BQS9DO0FBQ0FqQixRQUFBQSxxQkFBcUIsQ0FBQ0MsT0FBdEIsR0FBZ0MsSUFBaEM7QUFDQSxZQUFJRCxxQkFBcUIsQ0FBQ0csV0FBdEIsR0FBb0MsQ0FBeEMsRUFBMkNLLE1BQU0sQ0FBQ1UsUUFBUCxDQUFnQkMsTUFBaEI7QUFDM0NuQixRQUFBQSxxQkFBcUIsQ0FBQ0csV0FBdEIsR0FBb0MsQ0FBcEM7QUFDQSxPQUxELE1BS08sSUFBSUgscUJBQXFCLENBQUNHLFdBQXRCLEdBQW9DLENBQXhDLEVBQTJDO0FBQ2pESCxRQUFBQSxxQkFBcUIsQ0FBQ0ksaUJBQXRCLENBQXdDYSxNQUF4QyxDQUErQyxNQUEvQztBQUNBakIsUUFBQUEscUJBQXFCLENBQUNDLE9BQXRCLEdBQWdDLElBQWhDO0FBQ0FELFFBQUFBLHFCQUFxQixDQUFDRyxXQUF0QixJQUFxQyxDQUFyQztBQUNBLE9BSk0sTUFJQTtBQUNOSCxRQUFBQSxxQkFBcUIsQ0FBQ0MsT0FBdEIsR0FBZ0MsSUFBaEM7QUFDQUQsUUFBQUEscUJBQXFCLENBQUNHLFdBQXRCLElBQXFDLENBQXJDO0FBQ0E7QUFDRDs7QUFsQzRCO0FBQUE7QUFBQSxDQUE5QjtBQXFDQUUsQ0FBQyxDQUFDZSxRQUFELENBQUQsQ0FBWUMsS0FBWixDQUFrQixZQUFNO0FBQ3ZCLE1BQUksQ0FBQ0MsZUFBTCxFQUFzQjtBQUNyQnRCLElBQUFBLHFCQUFxQixDQUFDTSxVQUF0QjtBQUNBO0FBQ0QsQ0FKRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBDb3B5cmlnaHQgKEMpIE1JS08gTExDIC0gQWxsIFJpZ2h0cyBSZXNlcnZlZFxuICogVW5hdXRob3JpemVkIGNvcHlpbmcgb2YgdGhpcyBmaWxlLCB2aWEgYW55IG1lZGl1bSBpcyBzdHJpY3RseSBwcm9oaWJpdGVkXG4gKiBQcm9wcmlldGFyeSBhbmQgY29uZmlkZW50aWFsXG4gKiBXcml0dGVuIGJ5IE5pa29sYXkgQmVrZXRvdiwgMTIgMjAxOVxuICpcbiAqL1xuXG4vKiBnbG9iYWwgUGJ4QXBpLCBnbG9iYWxEZWJ1Z01vZGUgKi9cblxuY29uc3QgY29ubmVjdGlvbkNoZWNrV29ya2VyID0ge1xuXHR0aW1lT3V0OiAxMDAwLFxuXHR0aW1lT3V0SGFuZGxlOiAnJyxcblx0ZXJyb3JDb3VudHM6IDAsXG5cdCRjb25uZWN0aW9uRGltbWVyOiAkKCcjY29ubmVjdGlvbi1kaW1tZXInKSxcblx0aW5pdGlhbGl6ZSgpIHtcblx0XHQvLyDQl9Cw0L/Rg9GB0YLQuNC8INC+0LHQvdC+0LLQu9C10L3QuNC1INGB0YLQsNGC0YPRgdCwINC/0YDQvtCy0LDQudC00LXRgNCwXG5cdFx0Y29ubmVjdGlvbkNoZWNrV29ya2VyLnJlc3RhcnRXb3JrZXIoKTtcblx0fSxcblx0cmVzdGFydFdvcmtlcigpIHtcblx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KGNvbm5lY3Rpb25DaGVja1dvcmtlci50aW1lb3V0SGFuZGxlKTtcblx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIud29ya2VyKCk7XG5cdH0sXG5cdHdvcmtlcigpIHtcblx0XHRQYnhBcGkuUGluZ1BCWChjb25uZWN0aW9uQ2hlY2tXb3JrZXIuY2JBZnRlclJlc3BvbnNlKTtcblx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIudGltZW91dEhhbmRsZSA9IHdpbmRvdy5zZXRUaW1lb3V0KFxuXHRcdFx0Y29ubmVjdGlvbkNoZWNrV29ya2VyLndvcmtlcixcblx0XHRcdGNvbm5lY3Rpb25DaGVja1dvcmtlci50aW1lT3V0LFxuXHRcdCk7XG5cdH0sXG5cdGNiQWZ0ZXJSZXNwb25zZShyZXN1bHQpIHtcblx0XHRpZiAocmVzdWx0ID09PSB0cnVlKSB7XG5cdFx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIuJGNvbm5lY3Rpb25EaW1tZXIuZGltbWVyKCdoaWRlJyk7XG5cdFx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIudGltZU91dCA9IDMwMDA7XG5cdFx0XHRpZiAoY29ubmVjdGlvbkNoZWNrV29ya2VyLmVycm9yQ291bnRzID4gNSkgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXHRcdFx0Y29ubmVjdGlvbkNoZWNrV29ya2VyLmVycm9yQ291bnRzID0gMDtcblx0XHR9IGVsc2UgaWYgKGNvbm5lY3Rpb25DaGVja1dvcmtlci5lcnJvckNvdW50cyA+IDMpIHtcblx0XHRcdGNvbm5lY3Rpb25DaGVja1dvcmtlci4kY29ubmVjdGlvbkRpbW1lci5kaW1tZXIoJ3Nob3cnKTtcblx0XHRcdGNvbm5lY3Rpb25DaGVja1dvcmtlci50aW1lT3V0ID0gMTAwMDtcblx0XHRcdGNvbm5lY3Rpb25DaGVja1dvcmtlci5lcnJvckNvdW50cyArPSAxO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIudGltZU91dCA9IDEwMDA7XG5cdFx0XHRjb25uZWN0aW9uQ2hlY2tXb3JrZXIuZXJyb3JDb3VudHMgKz0gMTtcblx0XHR9XG5cdH0sXG59O1xuXG4kKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG5cdGlmICghZ2xvYmFsRGVidWdNb2RlKSB7XG5cdFx0Y29ubmVjdGlvbkNoZWNrV29ya2VyLmluaXRpYWxpemUoKTtcblx0fVxufSk7XG4iXX0=