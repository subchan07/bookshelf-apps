// {
//   id: string | number, -> 3657848524
//   title: string, -> 'Harry Potter and the Philosopher\'s Stone'
//   author: string, -> 'J.K Rowling'
//   year: number, -> 1997
//   isComplete: boolean, -> false
// }

// Constants
const RENDER_EVENT = "render bookshelf";
const STORAGE_KEY = "BOOKSHELF_APPS";
const SAVED_EVENT = "saved-book";

// Book data
const books = [];

const generateId = () => +new Date();

const generateBookObject = (id, title, author, year, isComplete) => ({
  id,
  title,
  author,
  year,
  isComplete,
});

const findBookByKeyword = (keyword, value) => {
  const keywordValid = ["title", "author", "year"];
  if (!keywordValid.includes(keyword)) return null;
  return books.filter((book) => book[keyword].includes(value));
};

const findBookIndex = (bookId) => books.findIndex((book) => book.id === bookId);

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
};

const savedData = () => {
  if (isStorageExist()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const loadDataFormStorage = () => {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (data) {
    books.push(...data);
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
};

const addBook = () => {
  const bookForm = document.getElementById("inputBookForm");
  const { bookTitle, bookAuthor, bookYear, bookIsComplete, bookSubmit } =
    bookForm.elements;
  const buttonSubmitMode = bookSubmit.getAttribute("data-mode");
  const buttonSubmitId = bookSubmit.getAttribute("data-id");

  let id = generateId();
  if (buttonSubmitMode === "edit") id = parseInt(buttonSubmitId);

  const bookObject = generateBookObject(
    id,
    bookTitle.value,
    bookAuthor.value,
    parseInt(bookYear.value),
    bookIsComplete.checked ?? false
  );
  
  if (bookIsComplete.checked) bookSubmit.classList.remove("active");

  if (buttonSubmitMode === "edit") updateBook(bookObject);
  else books.push(bookObject);

  bookForm.reset();
  bookTitle.focus();
  bookSubmit.textContent = "Tambah buku ke rak belum selesai dibaca";
  bookSubmit.setAttribute("class", "btn btn-purple w-full");
  bookSubmit.removeAttribute("data-id");
  bookSubmit.removeAttribute("data-mode");

  document.dispatchEvent(new Event(RENDER_EVENT));
  savedData();

  if (buttonSubmitMode === "edit") scrollToElement(`book-${id}`);
};

const updateBook = (updateBook) => {
  const bookIndex = findBookIndex(updateBook.id);
  console.log(bookIndex);
  console.log(updateBook);
  books[bookIndex] = updateBook;
};

const scrollToElement = (elTarget) => {
  const elementBookTarget = document.getElementById(elTarget);
  elementBookTarget.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  elementBookTarget.classList.add("active");

  setTimeout(() => {
    elementBookTarget.classList.remove("active");
  }, 1000);
};

const makeBookElement = (bookObject) => {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement("h4");
  textTitle.classList.add("text-normal");
  textTitle.textContent = title;

  const textAuthor = document.createElement("p");
  textAuthor.classList.add("text-small", "fw-semibold");
  textAuthor.textContent = author;

  const textYear = document.createElement("p");
  textYear.classList.add("text-small");
  textYear.textContent = year;

  const container = document.createElement("article");
  container.classList.add("bookItem");
  container.setAttribute("id", `book-${id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttons");

  const textContentActionButton = isComplete
    ? "belum selesai dibaca"
    : "selesai dibaca";

  const actionButton = createButtonElement(
    textContentActionButton,
    "btn btn-sm btn-success",
    () => toggleBookComplete(id)
  );

  const editButton = createButtonElement("Edit", "btn btn-sm btn-warning", () =>
    fillEditForm(id)
  );

  const trashButton = createButtonElement(
    "Hapus",
    "btn btn-sm btn-danger",
    () => showConfirmModal(id)
  );

  buttonContainer.append(actionButton, editButton, trashButton);
  container.append(textTitle, textAuthor, textYear, buttonContainer);
  return container;
};

const toggleBookComplete = (bookId) => {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    document.dispatchEvent(new Event(RENDER_EVENT));
    savedData();
  }
};

const removeBook = (bookId) => {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    savedData();
  }
};

const createButtonElement = (text, className, clickHandle) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  button.addEventListener("click", clickHandle);
  return button;
};

const fillEditForm = (bookId) => {
  const bookObject = books.find((book) => book.id === bookId);

  const bookForm = document.getElementById("inputBookForm");
  const { bookTitle, bookAuthor, bookYear, bookIsComplete, bookSubmit } =
    bookForm.elements;
  const { id, title, author, year, isComplete } = bookObject;

  bookTitle.value = title;
  bookAuthor.value = author;
  bookYear.value = year;
  bookIsComplete.checked = isComplete ?? false;

  bookSubmit.textContent = "Edit Buku";
  bookSubmit.setAttribute("class", "btn btn-warning w-full");
  bookSubmit.setAttribute("data-mode", "edit");
  bookSubmit.setAttribute("data-id", id);

  bookTitle.focus();
};

const showConfirmModal = (bookId) => {
  let modal = document.getElementById("myModal");
  let confirmButton = document.getElementById("confirmButton");
  let closeButton = document.getElementById("closeButton");

  modal.style.display = "block";

  confirmButton.addEventListener("click", () => {
    removeBook(bookId);
    modal.style.display = "none";
  });

  closeButton.addEventListener("click", () => (modal.style.display = "none"));
};

const renderBooks = (bookObject) => {
  const completedTodoList = document.getElementById("completeBookshelfList");
  const incompletedTodoList = document.getElementById(
    "incompleteBookshelfList"
  );

  completedTodoList.innerHTML = "";
  incompletedTodoList.innerHTML = "";

  if (Array.isArray(bookObject) && bookObject.length > 0) {
    bookObject.forEach((book) => {
      const bookElement = makeBookElement(book);

      book.isComplete
        ? completedTodoList.append(bookElement)
        : incompletedTodoList.append(bookElement);
    });
  } else {
    const message = document.createElement("h4");
    message.textContent = "data tidak ditemukan";

    const container = document.createElement("article");
    container.classList.add("bookItem");
    container.append(message);

    completedTodoList.append(container);
    incompletedTodoList.append(container.cloneNode(true));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const inputForm = document.getElementById("inputBookForm");
  const buttonSubmit = inputForm.bookSubmit;
  const checkboxButton = document.getElementById("bookIsComplete");

  if (isStorageExist()) {
    loadDataFormStorage();
  }

  inputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log('button saya klik');
    addBook();
  });

  checkboxButton.addEventListener("click", () => {
    const btnSubmitMode = buttonSubmit.getAttribute("data-mode");
    buttonSubmit.classList.toggle("active", checkboxButton.checked);

    let setButtonText = checkboxButton.checked
      ? "selesai dibaca"
      : "belum selesai dibaca";

    buttonSubmit.textContent =
      btnSubmitMode === "edit"
        ? "Edit buku"
        : `Tambah buku ke rak ${setButtonText}`;
  });

  // function search
  const inputSearchBook = document.getElementById("inputSearchBook");
  const selectSearchBook = document.getElementById("selectFilterSearch");
  const buttonSearchBook = document.getElementById("searchSubmit");

  buttonSearchBook.addEventListener("click", () => {
    const valueFilterSearch = selectSearchBook.value;
    const searchText = inputSearchBook.value;
    const findBookByFilters = findBookByKeyword(valueFilterSearch, searchText);

    renderBooks(findBookByFilters ?? books);
  });
});

document.addEventListener(RENDER_EVENT, () => renderBooks(books));
document.addEventListener(SAVED_EVENT, () =>
  console.log("Book berhasil di simpan")
);
