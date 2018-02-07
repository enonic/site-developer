// Nashorn doesn't have analogues for setTimeout;

exports.setTimeout = function (fn, millis) {

    var Timer = Java.type('java.util.Timer');
    var Phaser = Java.type('java.util.concurrent.Phaser');

    var timer = new Timer('jsEventLoop', false);
    var phaser = new Phaser();

    var timeoutStack = 0;

    function pushTimeout() {
        timeoutStack++;
    }

    function popTimeout() {
        timeoutStack--;
        if (timeoutStack > 0) {
            return;
        }
        timer.cancel();
        phaser.forceTermination();
    }

    var onTaskFinished = function () {
        phaser.arriveAndDeregister();
    };

    function doSetTimeout(fn, millis /* [, args...] */) {
        var args = [].slice.call(arguments, 2, arguments.length);

        var phase = phaser.register();
        var canceled = false;
        timer.schedule(function () {
            if (canceled) {
                return;
            }

            try {
                fn.apply(context, args);
            } catch (e) {
                print(e);
            } finally {
                onTaskFinished();
                popTimeout();
            }
        }, millis);

        pushTimeout();

        return function () {
            onTaskFinished();
            canceled = true;
            popTimeout();
        };
    };

    doSetTimeout(fn, millis);
};
