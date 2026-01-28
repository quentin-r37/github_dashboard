type Theme = "light" | "dark" | "system";

let theme = $state<Theme>(
	(typeof localStorage !== "undefined" && (localStorage.getItem("theme") as Theme)) || "system"
);

function applyDarkClass(isDark: boolean) {
	if (typeof document !== "undefined") {
		document.documentElement.classList.toggle("dark", isDark);
	}
}

function resolveEffective(t: Theme): boolean {
	if (t === "dark") return true;
	if (t === "light") return false;
	return typeof window !== "undefined" && matchMedia("(prefers-color-scheme: dark)").matches;
}

if (typeof window !== "undefined") {
	const mq = matchMedia("(prefers-color-scheme: dark)");
	mq.addEventListener("change", () => {
		if (theme === "system") {
			applyDarkClass(mq.matches);
		}
	});
}

export function getTheme(): Theme {
	return theme;
}

export function getEffectiveDark(): boolean {
	return resolveEffective(theme);
}

export function toggleTheme() {
	const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
	theme = next;

	if (typeof localStorage !== "undefined") {
		if (next === "system") {
			localStorage.removeItem("theme");
		} else {
			localStorage.setItem("theme", next);
		}
	}

	applyDarkClass(resolveEffective(next));
}
