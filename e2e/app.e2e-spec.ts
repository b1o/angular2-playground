import { Anuglar2PlaygroundPage } from './app.po';

describe('anuglar2-playground App', () => {
  let page: Anuglar2PlaygroundPage;

  beforeEach(() => {
    page = new Anuglar2PlaygroundPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
