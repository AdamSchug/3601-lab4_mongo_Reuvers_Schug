import {browser, protractor, element, by} from 'protractor';
import {Key} from 'selenium-webdriver';
import {TodoPage} from "./todo-list.po";

// This line (combined with the function that follows) is here for us
// to be able to see what happens (part of slowing things down)
// https://hassantariqblog.wordpress.com/2015/11/09/reduce-speed-of-angular-e2e-protractor-tests/

const origFn = browser.driver.controlFlow().execute;

browser.driver.controlFlow().execute = function () {
  let args = arguments;

  // Delay Control
  origFn.call(browser.driver.controlFlow(), () => {
    return protractor.promise.delayed(1);
  });

  return origFn.apply(browser.driver.controlFlow(), args);
};


describe('Todo list', () => {
  let page: TodoPage;

  beforeEach(() => {
    page = new TodoPage();
  });

  it('should get and highlight Todos title attribute ', () => {
    page.navigateTo();
    expect(page.getTodoTitle()).toEqual('Todos');
  });

  it('should type something in filter owner box and check that it returned correct element', () => {
    page.navigateTo();
    page.typeAnOwner('B');
    expect(page.getUniqueTodo('In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.')).toEqual('In sunt ex non tempor cillum commodo amet incididunt anim qui commodo quis. Cillum non labore ex sint esse.');
    page.backspace();
    page.typeAnOwner('Fry');
    expect(page.getUniqueTodo('Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.')).toEqual('Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.');
  });

  it('should type in filter owner, status, and body and check it returns correct element ', () => {
    page.navigateTo();
    page.typeAnOwner('Blanche');
    page.typeAStatus('true');
    page.typeABody('Incididunt en')
    expect(page.getUniqueTodo('Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.')).toEqual('Incididunt enim ea sit qui esse magna eu. Nisi sunt exercitation est Lorem consectetur incididunt cupidatat laboris commodo veniam do ut sint.');
  });

  it('Should open the expansion panel and get the category', () => {
    page.navigateTo();
    page.typeACategory('video games');

    expect(page.getUniqueTodo('Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.')).toEqual('Ipsum esse est ullamco magna tempor anim laborum non officia deserunt veniam commodo. Aute minim incididunt ex commodo.');

    browser.actions().sendKeys(Key.TAB).perform();
    browser.actions().sendKeys(Key.ENTER).perform();
  });


  it('Should allow us to search for company, update that search string, and then still successfully search', () => {
    page.navigateTo();
    page.typeABody('magna');
    page.getTodos().then((todos) => {
      expect(todos.length).toBe(76);
    });
    page.field('todoBody').sendKeys(' dolor');
    page.getTodos().then((todos) => {
      expect(todos.length).toBe(2);
    });
  });

  it('Should have an add todo button', () => {
    page.navigateTo();
    expect(page.elementExistsWithId('addNewTodo')).toBeTruthy();
  });

  it('Should open a dialog box when add todo button is clicked', () => {
    page.navigateTo();
    expect(page.elementExistsWithCss('add-todo')).toBeFalsy('There should not be a modal window yet');
    page.click('addNewTodo');
    expect(page.elementExistsWithCss('add-todo')).toBeTruthy('There should be a modal window now');
  });

  describe('Add Todo', () => {

    beforeEach(() => {
      page.navigateTo();
      page.click('addNewTodo');
    });

    it('Should actually add the todo with the information we put in the fields', () => {
      page.navigateTo();
      page.click('addNewTodo');
      page.field('ownerField').sendKeys('Terry');
      page.field('statusField').clear();
      page.field('statusField').sendKeys('true');
      page.field('bodyField').sendKeys('Terry\'s TODO Body text');
      page.field('categoryField').sendKeys('terry');
      expect(page.button('confirmAddTodoButton').isEnabled()).toBe(true);
      page.click('confirmAddTodoButton');

      const terry_element = element(by.id('Terry\'s TODO Body text'));
      browser.wait(protractor.ExpectedConditions.presenceOf(terry_element), 10000);

      expect(page.getUniqueTodo('Terry\'s TODO Body text')).toEqual('Terry\'s TODO Body text');
    });

    describe('Add Todo (Validation)', () => {

      afterEach(() => {
        page.click('exitWithoutAddingButton');
      });

      it('Should allow us to put information into the fields of the add todo dialog', () => {
        expect(page.field('ownerField').isPresent()).toBeTruthy('There should be an owner field');
        page.field('ownerField').sendKeys('Terry');
        expect(element(by.id('statusField')).isPresent()).toBeTruthy('There should be a status field');
        page.field('statusField').clear();
        page.field('statusField').sendKeys('true');
        expect(page.field('bodyField').isPresent()).toBeTruthy('There should be a body field');
        page.field('bodyField').sendKeys('Terry todo list');
        expect(page.field('categoryField').isPresent()).toBeTruthy('There should be a category field');
        page.field('categoryField').sendKeys('terrygory');
      });

      it('Should show the validation error message about status being not being true or false', () => {
        expect(element(by.id('statusField')).isPresent()).toBeTruthy('There should be a status field');
        page.field('statusField').clear();
        page.field('statusField').sendKeys('ngjadfj');
        expect(page.button('confirmAddTodoButton').isEnabled()).toBe(false);
        page.field('ownerField').click();
        expect(page.getTextFromField('status-error')).toBe('Must be true or false');
      });

      it('Should show the validation error message about the format of owner', () => {
        expect(element(by.id('ownerField')).isPresent()).toBeTruthy('There should be an owner field');
        page.field('ownerField').sendKeys('cy@');
        expect(page.button('confirmAddTodoButton').isEnabled()).toBe(false);
        page.field('categoryField').click();
        expect(page.getTextFromField('owner-error')).toBe('Must contain only numbers and letters');
      });

      it('Should show the validation error message about body being required', () => {
        expect(element(by.id('bodyField')).isPresent()).toBeTruthy('There should be a body field');
        page.field('bodyField').sendKeys('A\b');
        expect(page.button('confirmAddTodoButton').isEnabled()).toBe(false);
        page.field('ownerField').click();
        expect(page.getTextFromField('body-error')).toBe('Required');
      });

      it('Should show the validation error message about category being required', () => {
        expect(element(by.id('categoryField')).isPresent()).toBeTruthy('There should be a category field');
        page.field('categoryField').sendKeys('A\b');
        expect(page.button('confirmAddTodoButton').isEnabled()).toBe(false);
        page.field('bodyField').click();
        expect(page.getTextFromField('category-error')).toBe('Required');
      });
    });
  });
});

