//Scorebox functions

function updateHUDInfo(totalmon, foodamt, timerem)
{
    $("#money").html("MONEY: $" + totalmon.toFixed(2));
    $("#foodamt").html("FOOD: " + foodamt);

    let minutes = Math.floor(timerem / 60);
    let seconds = timerem % 60;
    let s1 = Math.floor(seconds / 10);
    let s2 = seconds % 10;

    $("#timerem").html("TIME: " + minutes + ":" + s1 + s2);
    if (timerem < 60)
    {
        $("#timerem").css("color", "red");
    }
}

//Menu functions

function toggleMenu()
{
    $("#menu").toggle();
}

function buyItem(itemName) 
{
    cart.push(itemName);
}

function showErrorMsg()
{
    $("#error-msg").show();
}

function hideErrorMsg()
{
    $("#error-msg").hide();    
}

//Info box functions

function showInfoBox(dict, itemName)
{
    $("#infobox").show();
    $("#description").html(dict.get(itemName));
}

function hideInfoBox()
{
    $("#infobox").hide();
}

function gameOver(score)
{
    $("#menu").hide();
    $("#gameover").show();
    $("#final-score").html("Score: " + score.toFixed(2));
}

function playDropSound()
{
    document.getElementById("dropSound").play();
}

$(document).ready(function()
{
    //Initialize item descriptions
    let dict = new Map();
    dict.set("food", "Food to feed fish.");
    dict.set("plant", "Applies a 5% multiplier to money earned each second. This effect can be stacked and only applies to plants that have been bought.");
    dict.set("minnow", "Standard fish. Hardy and easy to raise. Earns $0.05 per second.");
    dict.set("tiger", "Has vertical orange and black stripes running down its body. Earns $0.20 per second but requires more frequent feeding.")
    dict.set("puffer", "Capable of inflating its body when threatened. Earns $0.15 per second and requires less frequent feeding.");

    if (sandBoxMode)
    {
        $(".price").html("$0.00");
    }

    //Buy item
    $(".buy-btn").on("click", function()
    {
        buyItem($(this).attr("id"));
    });

    //Close menu
    $("#exit-menu-btn").on("click", function()
    {
        toggleMenu();
    });

    //Show/hide description in market
    $(".item").hover(function()
    {
        showInfoBox(dict, $(this).attr("id"));
    },
    function()
    {
        hideInfoBox();
    })

    //Start a new game
    $("#new-game").on("click", function()
    {
        location.reload();
    });

});