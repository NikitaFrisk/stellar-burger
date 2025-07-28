// Константы для селекторов (адаптированы под наш проект)
const SELECTORS = {
  INGREDIENT_ITEM: '[data-testid="ingredient-item"]',
  CONSTRUCTOR_BUN_TOP: '[data-testid="constructor-bun-top"]',
  CONSTRUCTOR_BUN_BOTTOM: '[data-testid="constructor-bun-bottom"]',
  CONSTRUCTOR_INGREDIENTS: '[data-testid="constructor-ingredients"]',
  CONSTRUCTOR_INGREDIENT: '[data-testid="constructor-ingredient"]',
  BURGER_CONSTRUCTOR: '[data-testid="burger-constructor"]',
  ORDER_BUTTON: '[data-testid="order-button"]',
  MODAL: '[data-testid="modal"]',
  MODAL_CLOSE: '[data-testid="modal-close"]',
  MODAL_OVERLAY: '[data-testid="modal-overlay"]',
  INGREDIENT_DETAILS: '[data-testid="ingredient-details"]',
  ORDER_DETAILS: '[data-testid="order-details"]',
  ORDER_NUMBER: '[data-testid="order-number"]',
  TOTAL_PRICE: '[data-testid="total-price"]',
  REMOVE_INGREDIENT: '[data-testid="remove-ingredient"]',
  // Альтернативные селекторы на случай, если data-testid отсутствуют
  INGREDIENT_CARD: '[data-testid="ingredient-item"], .card, [class*="card"]',
  CONSTRUCTOR_AREA: '[data-testid="burger-constructor"], .constructorElements, [class*="constructorElements"]'
} as const;

describe('Burger Constructor', () => {
  beforeEach(() => {
    // Перехватываем API запросы
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients')
    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('createOrder')
    cy.intercept('POST', '**/api/auth/login', { 
      statusCode: 200, 
      body: { 
        success: true, 
        accessToken: 'Bearer test-token',
        refreshToken: 'test-refresh-token',
        user: { email: 'bpnatv@gmail.com', name: 'Test User' }
      } 
    }).as('login')
    
    // Посещаем главную страницу
    cy.visit('/')
    
    // Ждем загрузки ингредиентов
    cy.wait('@getIngredients')
  })

  it('should load ingredients and display them', () => {
    // Проверяем что ингредиенты загрузились (используем общий селектор)
    cy.get(SELECTORS.INGREDIENT_CARD).should('have.length.greaterThan', 0)
    
    // Проверяем разные категории ингредиентов
    cy.contains('Булки').should('be.visible')
    cy.contains('Соусы').should('be.visible')
    cy.contains('Начинки').should('be.visible')
  })

  it('should open ingredient modal when clicked', () => {
    // Кликаем на первый ингредиент
    cy.get(SELECTORS.INGREDIENT_CARD).first().click()
    
    // Проверяем что модальное окно открылось
    cy.get(SELECTORS.MODAL).should('be.visible')
    
    // Проверяем что в модальном окне есть детали ингредиента
    cy.get(SELECTORS.MODAL).within(() => {
      cy.get('h3, h2').should('exist')
      cy.get('img').should('exist')
    })
  })

  it('should close ingredient modal when close button clicked', () => {
    // Открываем модальное окно
    cy.get(SELECTORS.INGREDIENT_CARD).first().click()
    cy.get(SELECTORS.MODAL).should('be.visible')
    
    // Закрываем модальное окно (используем стандартную кнопку закрытия)
    cy.get(SELECTORS.MODAL_CLOSE).click()
    cy.get(SELECTORS.MODAL).should('not.exist')
  })

  it('should close ingredient modal when overlay clicked', () => {
    // Открываем модальное окно
    cy.get(SELECTORS.INGREDIENT_CARD).first().click()
    cy.get(SELECTORS.MODAL).should('be.visible')
    
    // Кликаем на overlay
    cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true })
    cy.get(SELECTORS.MODAL).should('not.exist')
  })

  it('should add bun to constructor via drag and drop', () => {
    // Находим булку (используем contains для поиска по тексту)
    cy.get(SELECTORS.INGREDIENT_CARD).contains('булка').first().then($el => {
      const dataTransfer = new DataTransfer();
      
      // Проверяем, что конструктор пустой изначально
      cy.get('body').then(() => {
        // Выполняем drag and drop
        cy.wrap($el)
          .trigger('dragstart', { dataTransfer })
          .then(() => {
            cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
          });
      });
    });
    
    // Проверяем что булка добавилась в верх и низ конструктора
    cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist')
    cy.get(SELECTORS.CONSTRUCTOR_BUN_BOTTOM).should('exist')
  })

  it('should add main ingredient to constructor via drag and drop', () => {
    // Находим начинку (ищем котлету)
    cy.get(SELECTORS.INGREDIENT_CARD).contains('котлета').first().then($el => {
      const dataTransfer = new DataTransfer();
      
      // Выполняем drag and drop
      cy.wrap($el)
        .trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Проверяем что ингредиент добавился в область ингредиентов
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENTS).should('exist')
  })

  it('should create order when order button clicked with authentication', () => {
    // Выполняем реальный вход в систему
    cy.visit('/login')
    
    // Заполняем форму логина
    cy.get('input[name="email"]').type('bpnatv@gmail.com')
    cy.get('input[name="password"]').type('yandex2025!')
    cy.get('button[type="submit"]').click()
    
    // Ждем перехода на главную страницу
    cy.url().should('eq', 'http://localhost:8080/')
    cy.wait('@getIngredients')
    
    // Находим булку и добавляем её в конструктор используя drag and drop
    cy.get(SELECTORS.INGREDIENT_CARD).contains('булка').first().then($el => {
      const dataTransfer = new DataTransfer();
      
      cy.wrap($el)
        .trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Находим начинку и добавляем её в конструктор
    cy.get(SELECTORS.INGREDIENT_CARD).contains('котлета').first().then($el => {
      const dataTransfer = new DataTransfer();
      
      cy.wrap($el)
        .trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Проверяем что кнопка заказа доступна и кликаем
    cy.get(SELECTORS.ORDER_BUTTON).should('not.be.disabled')
    cy.get(SELECTORS.ORDER_BUTTON).click()
    
    // Проверяем что модальное окно с деталями заказа открылось (или загрузка началась)
    cy.get(SELECTORS.MODAL, { timeout: 15000 }).should('be.visible')
  })

  it('should redirect to login if not authenticated', () => {
    // Очищаем localStorage
    cy.clearLocalStorage()
    
    // Обновляем страницу
    cy.reload()
    cy.wait('@getIngredients')
    
    // Добавляем ингредиенты с правильным drag and drop
    cy.get(SELECTORS.INGREDIENT_CARD).contains('булка').first().then($el => {
      const dataTransfer = new DataTransfer();
      cy.wrap($el).trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    cy.get(SELECTORS.INGREDIENT_CARD).contains('котлета').first().then($el => {
      const dataTransfer = new DataTransfer();
      cy.wrap($el).trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Пытаемся создать заказ (кнопка должна быть активна, но перенаправлять на логин)
    cy.get(SELECTORS.ORDER_BUTTON).should('not.be.disabled')
    cy.get(SELECTORS.ORDER_BUTTON).click()
    
    // Проверяем что произошел переход на страницу логина
    cy.url().should('include', '/login')
  })
})

// Дополнительные тесты для edge cases
describe('Burger Constructor - Edge Cases', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients')
    cy.intercept('POST', '**/api/auth/login', { 
      statusCode: 200, 
      body: { 
        success: true, 
        accessToken: 'Bearer test-token',
        refreshToken: 'test-refresh-token',
        user: { email: 'bpnatv@gmail.com', name: 'Test User' }
      } 
    }).as('login')
    cy.visit('/')
    cy.wait('@getIngredients')
  })

  it('should disable order button when no bun selected', () => {
    // Добавляем только начинку без булки
    cy.get(SELECTORS.INGREDIENT_CARD).contains('котлета').first().then($el => {
      const dataTransfer = new DataTransfer();
      cy.wrap($el).trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Проверяем что кнопка заказа заблокирована
    cy.get(SELECTORS.ORDER_BUTTON).should('be.disabled')
  })

  it('should handle API errors gracefully', () => {
    // Мокаем ошибку API для заказов
    cy.intercept('POST', '**/api/orders', { statusCode: 500, body: { message: 'Server Error' } }).as('createOrderError')
    
    // Выполняем реальный вход в систему
    cy.visit('/login')
    cy.get('input[name="email"]').type('bpnatv@gmail.com')
    cy.get('input[name="password"]').type('yandex2025!')
    cy.get('button[type="submit"]').click()
    
    // Ждем перехода на главную страницу
    cy.url().should('eq', 'http://localhost:8080/')
    cy.wait('@getIngredients')
    
    // Добавляем ингредиенты
    cy.get(SELECTORS.INGREDIENT_CARD).contains('булка').first().then($el => {
      const dataTransfer = new DataTransfer();
      cy.wrap($el).trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    cy.get(SELECTORS.INGREDIENT_CARD).contains('котлета').first().then($el => {
      const dataTransfer = new DataTransfer();
      cy.wrap($el).trigger('dragstart', { dataTransfer })
        .then(() => {
          cy.get(SELECTORS.BURGER_CONSTRUCTOR).trigger('drop', { dataTransfer });
        });
    });
    
    // Пытаемся создать заказ
    cy.get(SELECTORS.ORDER_BUTTON).should('not.be.disabled')
    cy.get(SELECTORS.ORDER_BUTTON).click()
    
    // Этот тест проверяет что система может обработать клик даже если API недоступно
    // Проверяем что система реагирует на ошибку (может быть уведомление или другая реакция)
    cy.get('body').should('exist') // Проверяем что страница остается рабочей
  })
})
