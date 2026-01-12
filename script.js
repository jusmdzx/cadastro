// --- MÁSCARA DE CPF ---
const cpfInput = document.getElementById('cpf');
if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ""); 
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        e.target.value = value; 
    });
}

// --- VALIDAÇÃO MATEMÁTICA DE CPF ---
function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf == '') return false; // CPF vazio não é validado aqui (campo opcional no form, mas se preencher tem que ser valido)
    
    // Elimina CPFs inválidos conhecidos (111.111.111-11, etc)
    if (cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    
    // Valida 1º dígito verificador
    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    
    // Valida 2º dígito verificador
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    
    return true;
}

// --- FUNÇÕES DE ARMAZENAMENTO ---

function saveToLocalStorage(person) {
    const people = JSON.parse(localStorage.getItem('people')) || [];
    people.push(person);
    localStorage.setItem('people', JSON.stringify(people));
}

function loadFromLocalStorage() {
    const people = JSON.parse(localStorage.getItem('people')) || [];
    const userList = document.getElementById('user-list');

    if (!userList) return; 

    userList.innerHTML = '';

    if (people.length === 0) {
        userList.innerHTML = '<li style="text-align:center; padding:20px; background:none; border:none;">Nenhum usuário cadastrado.</li>';
        return;
    }

    people.forEach((person, index) => {
        const listItem = document.createElement('li');
        
        // Formatar Data (Converte de AAAA-MM-DD para DD/MM/AAAA)
        let dataFormatada = 'Não informada';
        if (person.birthdate) {
            const partes = person.birthdate.split('-'); 
            // partes[0] = ano, partes[1] = mes, partes[2] = dia
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }

        listItem.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:5px;">
                <strong><i class="fas fa-user"></i> ${person.name}</strong>
                <span style="font-size:13px; color:#666;"><i class="fas fa-envelope"></i> ${person.email}</span>
                <div style="display:flex; gap: 15px; font-size:12px; color:#888; margin-top:5px;">
                    <span><i class="fas fa-id-card"></i> CPF: ${person.cpf || '---'}</span>
                    <span><i class="fas fa-birthday-cake"></i> ${dataFormatada}</span>
                </div>
            </div>
            <div class="actions">
                <button class="edit-button" data-index="${index}" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="delete-button" data-index="${index}" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>
        `;
        userList.appendChild(listItem);
    });
}

// Editar Usuário
function editUser(index) {
    const people = JSON.parse(localStorage.getItem('people')) || [];
    const newName = prompt('Novo nome:', people[index].name);
    const newEmail = prompt('Novo e-mail:', people[index].email);

    if (newName && newEmail) {
        people[index].name = newName;
        people[index].email = newEmail;
        localStorage.setItem('people', JSON.stringify(people));
        loadFromLocalStorage();
    }
}

// Excluir Usuário
function deleteUser(index) {
    const people = JSON.parse(localStorage.getItem('people')) || [];
    if (confirm('Tem certeza que deseja excluir?')) {
        people.splice(index, 1);
        localStorage.setItem('people', JSON.stringify(people));
        loadFromLocalStorage();
    }
}

// --- EVENTOS ---

// Envio do formulário
if (document.getElementById('form')) {
    document.getElementById('form').addEventListener('submit', function (event) {
        event.preventDefault();
        
        // Coleta de dados
        const data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            birthdate: document.getElementById('birthdate').value,
            gender: document.getElementById('gender').value,
            nationality: document.getElementById('nationality').value,
            state: document.getElementById('state').value,
            address: document.getElementById('address').value
        };

        // VALIDAÇÃO DE CPF: Se tem CPF preenchido, ele deve ser válido
        if (data.cpf && !validarCPF(data.cpf)) {
            alert('CPF Inválido! Por favor, verifique os números digitados.');
            document.getElementById('cpf').focus(); // Foca no campo com erro
            return; // Interrompe o salvamento
        }

        if (data.name && data.email) {
            saveToLocalStorage(data);
            alert('Cadastro realizado com sucesso!');
            document.getElementById('form').reset();
        } else {
            alert('Preencha os campos obrigatórios!');
        }
    });
}

// Inicialização e Botões Globais
document.addEventListener('DOMContentLoaded', function () {
    loadFromLocalStorage();

    // Lógica da Barra de Pesquisa
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#user-list li');

            items.forEach(item => {
                const text = item.innerText.toLowerCase();
                // Procura o texto digitado dentro de cada item da lista
                if (text.includes(term)) {
                    item.style.display = 'flex'; 
                } else {
                    item.style.display = 'none'; 
                }
            });
        });
    }

    // Botão de ir para a consulta
    const viewUsersBtn = document.getElementById('view-users');
    if (viewUsersBtn) {
        viewUsersBtn.addEventListener('click', () => window.location.href = 'consulta.html');
    }

    // Botão de voltar para o cadastro
    const backBtn = document.getElementById('back-button');
    if (backBtn) {
        backBtn.addEventListener('click', () => window.location.href = 'index.html');
    }

    // Eventos de clique na lista (Editar/Excluir)
    if (document.getElementById('user-list')) {
        document.getElementById('user-list').addEventListener('click', function (event) {
            const target = event.target.closest('button'); 
            if (!target) return;

            const index = target.dataset.index;
            if (target.classList.contains('edit-button')) editUser(index);
            if (target.classList.contains('delete-button')) deleteUser(index);
        });
    }
});