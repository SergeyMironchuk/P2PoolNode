import { P2PoolNodePage } from './app.po';

describe('p2-pool-node App', () => {
  let page: P2PoolNodePage;

  beforeEach(() => {
    page = new P2PoolNodePage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
