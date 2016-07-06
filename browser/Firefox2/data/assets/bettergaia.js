/*
bettergaia.js
cross browser framework for browser extension apis
inspired by xkit
Copyright (c) BetterGaia and Bowafishtech
*/
/*global localStorage: false, console: false, $: false, chrome: false, BetterGaia: false, Storage: false */
/*jshint sub:true */

//BetterGaia.insert.css('');

function settingsOpen() {
    if ($('#BGSettings').length === 0) {
        BetterGaia.localFile('assets/settingsEmbed.html');
        self.port.on('assets/settingsEmbed.html', function(data) {
            $('html').append(data);
            $('#BGSLogo').prepend('<img src="' + BetterGaia.path('images/128.png') + '">');

            // Set up menu
            $('#BGSMenu').on('click', 'a:not(.active)', function() {
                var name = $(this).attr('data-link');
                $('#BGSMenu a.active, #BGSPages .page.active').removeClass('active');
                $('#BGSPages .page.' + name).addClass('active');
                $(this).addClass('active');
            });

            $('#BGSCloseMenu').on('click', function() {
                $('html').removeClass('BGSOpen');
                window.location.hash = '';
            });

            // List installed extensions
            if (Storage.data['extensions'] instanceof Array) {
                for (var i = 0; i < Storage.data['extensions'].length; i++) {
                    var extension = Storage.data['extensions'][i];

                    $('#BGSPages .page.mybg .extensionsList').append('<a extension-id="' + extension.id + '">' + extension.title + '</a>');
                }
            }

            // Get list of extensions
            $('#BGSMenu a[data-link="get"]').on('click.get', function() {
                $(this).off('click.get');
                $('#BGSPages .page.get').addClass('loaded');

                $.ajax({
                    url: BetterGaia.serverUrl + 'framework/extensions/list.json',
                    dataType: 'json'
                }).done(function(data) {
                    $('#BGSPages .page.get .loading .default').addClass('hidden');
                    if (!data['enabled']) {
                        $('#BGSPages .page.get .loading .disabled').removeClass('hidden');
                        return;
                    }

                    for (var i = 0; i < data['extensions'].length; i++) {
                        if (Storage.data['extensionsInstalled'].indexOf(data['extensions'][i]['id']) == -1) {
                            data['extensions'][i]['notInstalled'] = true;
                        }
                    }

                    var template = Handlebars.compile($('#BGSPages .page.get ul').html());
                    var rendered = template(data);
                    $('#BGSPages .page.get ul').html(rendered).removeClass('hidden');
                    $('#BGSPages .page.get .loading').addClass('hidden');

                    //if (Storage.data['extensions'].indexOf(key)) {}

                }).fail(function(data) {
                    $('#BGSPages .page.get .loading .default').addClass('hidden');
                    $('#BGSPages .page.get .loading .offline').removeClass('hidden');
                });
            });

            // install new extensions
            $('#BGSPages .page.get ul').on('click', 'li a.install', function() {
                $(this).text('Installing...');
                $(this).off('click.install');
                BetterGaia.install.extension($(this).attr('data-id'), function(data) {
                    if (data['success']) BetterGaia.console.log('Installed!');
                    $('#BGSPages .page.get a[data-id="' + data['id'] + '"]').text('Added');
                });
            });
        });
    }

    // open settings
    $('html').addClass('BGSOpen');
}

$(document).ready(function() {
    if (window.location.hash === '#bgsettings') settingsOpen();

    $(window).on('hashchange', function() {
        if (window.location.hash === '#bgsettings') settingsOpen();
    });
});