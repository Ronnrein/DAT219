var url = "/Home/News";
var storyUrl = "/Home/Story";
var element = ".newsticker";
var listItemTemplate = "<a class='list-group-item'></a>";
var interval = 5000;
var animationTime = 600;
var maxItems = 5;
var defaultImageUrl = "https://img.buzzfeed.com/buzzfeed-static/static/2017-02/28/11/campaign_images/buzzfeed-prod-fastlane-01/the-way-you-read-will-reveal-what-type-of-person--2-701-1488297785-2_dblwide.jpg";

var lastId;

$(document).ready(function() {
    setInterval(loadNews, interval);
    loadNews();
});

function loadNews() {
    $.getJSON(lastId === undefined ? url : url+"/"+lastId, function(data) {
        $.each(data, function(k, v) {
            $(listItemTemplate).prependTo(element+" > div").attr("href", storyUrl+"/"+v.id).html(v.title).hide().slideDown(animationTime);
        });
        $(element+" > div").children("a").each(function(k) {
            $(this).css("font-weight", k === 0 ? "bold" : "normal");
            if (k >= maxItems) {
                if (lastId === undefined) {
                    $(this).remove();
                    return true;
                }
                $(this).slideUp(animationTime, function() {
                    $(this).remove();
                });
            }
        });
        if (data.length) {
            var last = data[data.length-1];
            lastId = last.id;
            $(element+" > img").attr("src", last.imageUrl === null  ? defaultImageUrl : last.imageUrl);
        }
    });
}