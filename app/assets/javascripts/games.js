/*global $, document, alert, console */
/*jslint white: true */

var currentGame = {};
var showForm = false;
var showCharacterForm = false;
var editingGame;
var editingCharacter;

$(document).ready(function () {
  'use strict';

  function toggle() {
    showForm = !showForm;
    $('#game-form').remove();
    $('#games-list').toggle();

    if (showForm) {
      console.log(editingGame);
      $.ajax({
        url: '/game_form',
        method: 'GET',
        data: { id: editingGame }
      }).done( function(html) {
        $('#toggle').after(html);
      });
    }
  }

  function toggleCharacter() {
    showCharacterForm = !showCharacterForm;
    $('#character-form').remove();
    $('#character-list').toggle();
    console.log('toggleCharacter');

    if (showCharacterForm) {
      console.log('showCharacterForm is true');

      $.ajax({
        // url: '/games/' + currentGame.id + '/characters/' + editingCharacter + 'form',
        url: '/character_form',
        method: 'GET',
        data: { game_id: editingGame, id: editingCharacter }
        // data: { game_id: currentGame.id, id: editingCharacter }
        // data: { character_id: editingCharacter, id: editingCharacter }
      }).done( function(html) {
        $('#toggle-character').after(html);
      });
    }
  }

  function getGame(id) {
    $.ajax({
      url: '/games/' + id,
      method: 'GET'
    }).done( function(game) {
      if (editingGame) {
        var li = $("[data-id='" + id + "'");
        $(li).parent().replaceWith(game);
        editingGame = null;
      } else {
        $('#games-list').append(game);
      }
    });
  }

  function getCharacter(id) {
    $.ajax({
      // url: '/games/' + id,
      url: '/games/' + currentGame.id + '/characters/' + id,
      method: 'GET'
    }).done( function(character) {
      if (editingCharacter) {
        var li = $("[data-id='" + id + "'");
        $(li).parent().replaceWith(character);
        editingCharacter = null;
      } else {
        $('#character-list').append(character);
      }
    });
  }

  $(document).on('submit', '#game-form form', function(e) {
    e.preventDefault();
    var
      data = $(this).serializeArray(),
      url = '/games',
      method = 'POST';

    if (editingGame) {
      url = url + '/' + editingGame;
      method = 'PUT'; // was colon vs an equals before
    }

    $.ajax({
      url: url,
      type: method,
      dataType: 'JSON',
      data: data
    }).done( function(game) {
      toggle();
      getGame(game.id);
    }).fail( function(err) {
      alert(err.responseJSON.errors);
    });
  });

  $(document).on('submit', '#character-form form', function(e) { //***
    e.preventDefault();
    var
      data = $(this).serializeArray(),
      url = '/games', //***
      method = 'POST';

    if (editingCharacter) {
      url = url + '/' + editingCharacter;
      method = 'PUT'; // was colon vs an equals before
    }

    $.ajax({
      url: url,
      type: method,
      dataType: 'JSON',
      data: data
    }).done( function(character) {
      toggle();
      getCharacter(character.id);
    }).fail( function(err) {
      alert(err.responseJSON.errors);
    });
  });

  $('#toggle').on('click', function() {
    toggle();
  });

  $('#toggle-character').on('click', function() {
    console.log('hello');
    toggleCharacter();
  });

  $(document).on('click', '#edit-game', function() {
    editingGame = $(this).siblings('.game-item').data().id;
    // console.log(editingGame);
    toggle();
  });

  $(document).on('click', '#edit-character', function() {
    editingCharacter = $(this).siblings('.character-item').data().id;
    console.log(editingCharacter);
    toggleCharacter();
  });

  $(document).on('click', '#delete-game', function() {
    var id = $(this).siblings('.game-item').data().id;
    $.ajax({
      url: '/games/' + id,
      method: 'DELETE'
    }).done( function() {
      var row = $("[data-id='" + id + "'");
      row.parent('li').remove();
    });
  });

  $(document).on('click', '#delete-character', function() {
    var charId = $(this).siblings('.character-item').data().id;
    $.ajax({
      url: '/games/' + currentGame.id + '/characters/' + charId,
      method: 'DELETE'
    }).done( function() {
      var row = $("[data-id='" + charId + "'");
      row.parent('li').remove();
    });
  });

  $(document).on('click', '.game-item', function() {
    currentGame.id = this.dataset.id; // ***** //
    currentGame.name = this.dataset.name;
    // console.log(currentGame.id);
    // console.log(currentGame.name);

    $.ajax({
      url: '/games/' + currentGame.id + '/characters',
      method: 'GET',
      dataType: 'JSON'
    }).done( function(characters) {
      $('#game').text('Characters in ' + currentGame.name);
      var list = $('#characters');
      list.empty();
      characters.forEach( function(char) {
        var
          openDiv = ('<div class="character-item" data-id=' + char.id + ' data-name=' + char.name + '>' ),
          closeDiv = ('</div>'),
          buttonEdit = ('<button class="btn" id="edit-character">Edit</button>'),
          buttonDelete = ('<button class="btn" id="delete-character">Delete</button>'),
          li = '<li data-character-id="' +  char.id + '">' + openDiv + char.name + '-' + char.power + closeDiv + buttonEdit + buttonDelete + '</li>';

        list.append(li);
      });
    });
  });
});
