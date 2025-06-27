// Типы для опций cookie
interface ICookieOptions {
	path?: string;
	domain?: string;
	expires?: Date | string;
	'max-age'?: number;
	secure?: boolean;
	sameSite?: 'strict' | 'lax' | 'none';
	httpOnly?: boolean;
}

export function getCookie(name: string): string | undefined {
	const matches = document.cookie.match(
		new RegExp(
			'(?:^|; )' +
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
				'=([^;]*)'
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name: string, value: string, options: ICookieOptions = {}): void {
	const finalOptions: ICookieOptions = {
		path: '/',
		...options,
	};

	if (finalOptions.expires instanceof Date) {
		finalOptions.expires = finalOptions.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) + '=' + encodeURIComponent(value);

	for (const optionKey in finalOptions) {
		updatedCookie += '; ' + optionKey;
		const optionValue = finalOptions[optionKey as keyof ICookieOptions];
		if (optionValue !== true) {
			updatedCookie += '=' + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

export function deleteCookie(name: string): void {
	setCookie(name, '', {
		'max-age': -1,
	});
} 