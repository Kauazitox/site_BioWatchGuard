(function($) {

	/**
	 * @return {jQuery} objeto jQuery.
	 */
	$.fn.navList = function() {

		var	$this = $(this);
			$a = $this.find('a'),
			b = [];

		$a.each(function() {

			var	$this = $(this),
				indent = Math.max(0, $this.parents('li').length - 1),
				href = $this.attr('href'),
				target = $this.attr('target');

			b.push(
				'<a ' +
					'class="link depth-' + indent + '"' +
					( (typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
					( (typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
				'>' +
					'<span class="indent-' + indent + '"></span>' +
					$this.text() +
				'</a>'
			);

		});

		return b.join('');

	};

	/**
	 * Panel-ify um elemento.
	 * @param {object} userConfig Configuração do usuário.
	 * @return {jQuery} objeto jQuery.
	 */
	$.fn.panel = function(userConfig) {

		// Sem elementos?
			if (this.length == 0)
				return $this;

		// Vários elementos?
			if (this.length > 1) {

				for (var i=0; i < this.length; i++)
					$(this[i]).panel(userConfig);

				return $this;

			}

		// Vars.
			var	$this = $(this),
				$body = $('body'),
				$window = $(window),
				id = $this.attr('id'),
				config;

		// Config.
			config = $.extend({

				// Atraso.
					delay: 0,

				// Ocultar painel ao clicar no link.
					hideOnClick: false,

				// Ocultar painel ao pressionar a tecla Escape.
					hideOnEscape: false,

				// Ocultar painel ao deslizar.
					hideOnSwipe: false,

				// Redefinir a posição de rolagem ao ocultar.
					resetScroll: false,

				// Redefinir formulários ao ocultar.
					resetForms: false,

				// Ao lado da janela de visualização, o painel aparecerá.
					side: null,

				// Elemento de destino para "classe".
					target: $this,

				// Classe para alternar.
					visibleClass: 'visible'

			}, userConfig);

			// Expanda "target" se ainda não for um objeto jQuery.
				if (typeof config.target != 'jQuery')
					config.target = $(config.target);

		// Panel.

			// Methods.
				$this._hide = function(event) {

					// Já está escondido? Fiança.
						if (!config.target.hasClass(config.visibleClass))
							return;

					// Se um evento foi fornecido, cancele-o.
						if (event) {

							event.preventDefault();
							event.stopPropagation();

						}

					// Esconder.
						config.target.removeClass(config.visibleClass);

					// Coisas pós-ocultar.
						window.setTimeout(function() {

							// Redefinir a posição de rolagem.
								if (config.resetScroll)
									$this.scrollTop(0);

							// Redefinir formulários.
								if (config.resetForms)
									$this.find('form').each(function() {
										this.reset();
									});

						}, config.delay);

				};

			// Correções do fornecedor.
				$this
					.css('-ms-overflow-style', '-ms-autohiding-scrollbar')
					.css('-webkit-overflow-scrolling', 'touch');

			// Ocultar ao clicar.
				if (config.hideOnClick) {

					$this.find('a')
						.css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

					$this
						.on('click', 'a', function(event) {

							var $a = $(this),
								href = $a.attr('href'),
								target = $a.attr('target');

							if (!href || href == '#' || href == '' || href == '#' + id)
								return;

							// Cancelar evento original.
								event.preventDefault();
								event.stopPropagation();

							// Ocultar painel.
								$this._hide();

							// Redirecionar para href.
								window.setTimeout(function() {

									if (target == '_blank')
										window.open(href);
									else
										window.location.href = href;

								}, config.delay + 10);

						});

				}

			// Evento: Toque em coisas.
				$this.on('touchstart', function(event) {

					$this.touchPosX = event.originalEvent.touches[0].pageX;
					$this.touchPosY = event.originalEvent.touches[0].pageY;

				})

				$this.on('touchmove', function(event) {

					if ($this.touchPosX === null
					||	$this.touchPosY === null)
						return;

					var	diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
						diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
						th = $this.outerHeight(),
						ts = ($this.get(0).scrollHeight - $this.scrollTop());

					// Ocultar ao deslizar?
						if (config.hideOnSwipe) {

							var result = false,
								boundary = 20,
								delta = 50;

							switch (config.side) {

								case 'left':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
									break;

								case 'right':
									result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
									break;

								case 'top':
									result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
									break;

								case 'bottom':
									result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
									break;

								default:
									break;

							}

							if (result) {

								$this.touchPosX = null;
								$this.touchPosY = null;
								$this._hide();

								return false;

							}

						}

					// Evite a rolagem vertical além da parte superior ou inferior.
						if (($this.scrollTop() < 0 && diffY < 0)
						|| (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

							event.preventDefault();
							event.stopPropagation();

						}

				});

			// Evento: Evita que certos eventos dentro do painel borbulhem.
				$this.on('click touchend touchstart touchmove', function(event) {
					event.stopPropagation();
				});

			// Evento: oculta o painel se uma tag âncora filha apontando para seu ID for clicada.
				$this.on('click', 'a[href="#' + id + '"]', function(event) {

					event.preventDefault();
					event.stopPropagation();

					config.target.removeClass(config.visibleClass);

				});

		// Corpo.
			// Evento: Ocultar painel ao clicar/tocar no corpo.
				$body.on('click touchend', function(event) {
					$this._hide(event);
				});

			// Evento: Alternar.
				$body.on('click', 'a[href="#' + id + '"]', function(event) {

					event.preventDefault();
					event.stopPropagation();

					config.target.toggleClass(config.visibleClass);

				});

		// Window.

			// Evento: Ocultar no ESC.
				if (config.hideOnEscape)
					$window.on('keydown', function(event) {

						if (event.keyCode == 27)
							$this._hide(event);

					});

		return $this;

	};

	/**
	 * * Aplique polyfill do atributo "espaço reservado" a um ou mais formulários.
	 *  @return {jQuery} objeto jQuery.
	 */
	$.fn.placeholder = function() {

		// O navegador suporta nativamente espaços reservados? Fiança.
			if (typeof (document.createElement('input')).placeholder != 'undefined')
				return $(this);

		// Sem elementos?
			if (this.length == 0)
				return $this;

		// Vários elementos?
			if (this.length > 1) {

				for (var i=0; i < this.length; i++)
					$(this[i]).placeholder();

				return $this;

			}

		// Vars.
			var $this = $(this);

		// Texto, TextArea.
			$this.find('input[type=text],textarea')
				.each(function() {

					var i = $(this);

					if (i.val() == ''
					||  i.val() == i.attr('placeholder'))
						i
							.addClass('polyfill-placeholder')
							.val(i.attr('placeholder'));

				})
				.on('blur', function() {

					var i = $(this);

					if (i.attr('name').match(/-polyfill-field$/))
						return;

					if (i.val() == '')
						i
							.addClass('polyfill-placeholder')
							.val(i.attr('placeholder'));

				})
				.on('focus', function() {

					var i = $(this);

					if (i.attr('name').match(/-polyfill-field$/))
						return;

					if (i.val() == i.attr('placeholder'))
						i
							.removeClass('polyfill-placeholder')
							.val('');

				});

		// Senha.
			$this.find('input[type=password]')
				.each(function() {

					var i = $(this);
					var x = $(
								$('<div>')
									.append(i.clone())
									.remove()
									.html()
									.replace(/type="password"/i, 'type="text"')
									.replace(/type=password/i, 'type=text')
					);

					if (i.attr('id') != '')
						x.attr('id', i.attr('id') + '-polyfill-field');

					if (i.attr('name') != '')
						x.attr('name', i.attr('name') + '-polyfill-field');

					x.addClass('polyfill-placeholder')
						.val(x.attr('placeholder')).insertAfter(i);

					if (i.val() == '')
						i.hide();
					else
						x.hide();

					i
						.on('blur', function(event) {

							event.preventDefault();

							var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

							if (i.val() == '') {

								i.hide();
								x.show();

							}

						});

					x
						.on('focus', function(event) {

							event.preventDefault();

							var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');

							x.hide();

							i
								.show()
								.focus();

						})
						.on('keypress', function(event) {

							event.preventDefault();
							x.val('');

						});

				});

		// Events.
			$this
				.on('submit', function() {

					$this.find('input[type=text],input[type=password],textarea')
						.each(function(event) {

							var i = $(this);

							if (i.attr('name').match(/-polyfill-field$/))
								i.attr('name', '');

							if (i.val() == i.attr('placeholder')) {

								i.removeClass('polyfill-placeholder');
								i.val('');

							}

						});

				})
				.on('reset', function(event) {

					event.preventDefault();

					$this.find('select')
						.val($('option:first').val());

					$this.find('input,textarea')
						.each(function() {

							var i = $(this),
								x;

							i.removeClass('polyfill-placeholder');

							switch (this.type) {

								case 'submit':
								case 'reset':
									break;

								case 'password':
									i.val(i.attr('defaultValue'));

									x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

									if (i.val() == '') {
										i.hide();
										x.show();
									}
									else {
										i.show();
										x.hide();
									}

									break;

								case 'checkbox':
								case 'radio':
									i.attr('checked', i.attr('defaultValue'));
									break;

								case 'text':
								case 'textarea':
									i.val(i.attr('defaultValue'));

									if (i.val() == '') {
										i.addClass('polyfill-placeholder');
										i.val(i.attr('placeholder'));
									}

									break;

								default:
									i.val(i.attr('defaultValue'));
									break;

							}
						});

				});

		return $this;

	};

	/**
	 * @param {jQuery} $elementos
	 * @param {bool} condição
	 */
	$.prioritize = function($elements, condition) {

		var key = '__prioritize';

		// Expanda $elements se ainda não for um objeto jQuery.
			if (typeof $elements != 'jQuery')
				$elements = $($elements);

		// Percorra os elementos.
			$elements.each(function() {

				var	$e = $(this), $p,
					$parent = $e.parent();

				// Nenhum pai? Fiança.
					if ($parent.length == 0)
						return;

				// Não se mudou? Mova isso.
					if (!$e.data(key)) {

						// A condição é falsa? Fiança.
							if (!condition)
								return;

						// Obtenha o placeholder (que servirá como nosso ponto de referência para quando este elemento precisar voltar).
							$p = $e.prev();

							// Não foi possível encontrar nada? Significa que este elemento já está no topo, então saia.
								if ($p.length == 0)
									return;

						// Mova o elemento para o topo do pai.
							$e.prependTo($parent);

						// Marcar o elemento como movido.
							$e.data(key, $p);

					}

				// Já se mudou?
					else {

						// A condição é verdadeira? Fiança.
							if (condition)
								return;

						$p = $e.data(key);

						// Mova o elemento de volta ao seu local original (usando nosso espaço reservado).
							$e.insertAfter($p);

						// Desmarque o elemento como movido.
							$e.removeData(key);

					}

			});

	};

})(jQuery);
