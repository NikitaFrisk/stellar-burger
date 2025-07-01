# Кастомные хуки

## useForm

Универсальный хук для управления состоянием форм. Автоматически обрабатывает изменения инпутов по атрибуту `name`.

### Использование

```typescript
import { useForm } from '@hooks/useForm';

// В компоненте
const { values, handleChange, setValues } = useForm({
  email: '',
  password: ''
});

// В JSX
<input
  name="email"
  value={values.email}
  onChange={handleChange}
/>
```

### API

- `values` - объект с текущими значениями формы
- `handleChange` - функция для обработки изменений (автоматически подставляется в `onChange`)
- `setValues` - функция для программного изменения значений

### Преимущества

- ✅ Убирает дублирование кода обработки форм
- ✅ Типизированный (TypeScript)
- ✅ Автоматическое обновление по `name` атрибуту
- ✅ Гибкий - принимает любую структуру данных 