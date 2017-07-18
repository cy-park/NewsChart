if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);

function init(){
	const $$dataset = document.querySelectorAll('script[type="text/news-chart"]');

	for (let i = 0; i < $$dataset.length; i++) {

		const $data = $$dataset[i];
		const $wrp = $data.parentNode;

	}
}
