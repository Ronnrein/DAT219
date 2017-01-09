
function App() {
    this.searchInputEl = "#search-input";
    this.searchResultEl = "#search-result";
    this.widget1El = "#header1-widget";
    this.steamStatusEl = "#steam-status";
    this.steamGamesEl = "#steam-games";
    this.steamPlaytimeEl = "#steam-playtime";
    this.steamMostPlayedEl = "#steam-most-played";

    var self = this;

    init();

    function init() {
        new WidgetSpectrum(self.widget1El, 10, 500);
        new WidgetGameSearch(self.searchInputEl, self.searchResultEl, function(steam) {
            $(self.steamStatusEl).html(steam.isOnline() ? "Online" : "Offline");
            $(self.steamGamesEl).html(steam.getGameCount());
            $(self.steamPlaytimeEl).html(steam.getTotalPlaytime());
            $(self.steamMostPlayedEl).html(steam.getMostPlayedGame());
        });
    }
}

function WidgetSpectrum(container, bars, interval) {
    this.container = $(container);
    this.animationTime = interval;

    var self = this;

    init();

    function init() {
        for(var i = 0; i < bars; i++) {
            self.container.append("<div></div>");
        }
        animate();
        setInterval(animate, self.animationTime);
    }

    function animate() {
        self.container.children("div").each(function() {
            var height = Math.floor(Math.random() * (90-10+1) + 10);
            $(this).stop(true, true).animate({height: height+"%"}, self.animationTime, "linear");
        });
    }
}

function WidgetGameSearch(inputElement, resultElement, callback) {
    this.steamUserURL = "http://div.ronnrein.com/proxy.php?data=steamUser";
    this.steamGamesURL = "http://div.ronnrein.com/proxy.php?data=steamGames";
    this.inputElement = $(inputElement);
    this.resultElement = $(resultElement);

    var steamUserData;
    var steamGamesData;
    var self = this;

    init();

    this.searchForGame = function(searchString) {
        if(steamGamesData === undefined || searchString === "") {
            return undefined;
        }
        return $.grep(steamGamesData.games, function(item) {
            return item.name.toLowerCase().indexOf(searchString.toLowerCase()) >= 0;
        })[0];
    };

    this.getGameCount = function() {
        return steamGamesData.game_count;
    };

    this.getTotalPlaytime = function() {
        var playtime = 0;
        $.each(steamGamesData.games, function(i, item) {
            playtime += item.playtime_forever;
        });
        return Math.floor(playtime/60);
    };

    this.isOnline = function() {
        return !!steamUserData.personastate;
    };

    this.getMostPlayedGame = function() {
        return steamGamesData.games[0].name;
    };

    function init() {
        $.when(
            $.getJSON(self.steamUserURL),
            $.getJSON(self.steamGamesURL)
        ).done(function(data1, data2) {
            steamUserData = data1[0].response.players[0];
            steamGamesData = data2[0].response;
            steamGamesData.games.sort(sortByHoursPlayed);
            bindEvents();
            callback(self);
        });
    }

    function sortByHoursPlayed(a, b) {
        return a.playtime_forever < b.playtime_forever ? 1 : b.playtime_forever < a.playtime_forever ? -1 : 0;
    }

    function searchInputChanged() {
        var game = self.searchForGame(self.inputElement.val());
        if(game !== undefined) {
            self.resultElement.html(game.name);
        }
        else {
            self.resultElement.html("");
        }
    }

    function bindEvents() {
        self.inputElement.on("keyup change", searchInputChanged);
    }
}

$(document).ready(function(){
    new App();
});