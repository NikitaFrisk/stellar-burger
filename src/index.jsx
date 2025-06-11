import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/app/app';
import './styles.css';
import { Provider } from 'react-redux';
import { store } from './services/store';

const domNode = document.getElementById('root');
const root = createRoot(domNode);
root.render(
	<StrictMode>
		<Provider store={store}>
			<App />
			<div id='modals'></div>
		</Provider>
	</StrictMode>
);
