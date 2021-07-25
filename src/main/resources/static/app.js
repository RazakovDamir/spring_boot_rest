const tbody = $("#maintable tbody");
$(document).ready(() => {
    getAllUsers();
});

function getAllUsers() {
    fetch("/api/users").then((response) => {
        console.log(response)
        if (response.ok) {
            response.json().then((users) => {
                users.forEach((user) => {
                    addUserRow(user)
                });
            });
        } else {
            console.error(response.status + " - " + response.statusText);
        }
    });
}

function addUserRow(user) {
    tbody.append(
        "<tr>" +
        "<td>" + user.id + "</td>" +
        "<td>" + user.lastname + "</td>" +
        "<td>" + user.name + "</td>" +
        "<td>" + user.age + "</td>" +
        "<td>" + user.username + "</td>" +
        "<td>" + user.roles.map(role => role.role.substr(5)) + "</td>" +
        "<td><button class='btn btn-primary' onclick='event.preventDefault(); editModal(" + user.id + ")'>Edit</button></td>" +
        "<td><button class='btn btn-danger' onclick='event.preventDefault(); deleteModal(" + user.id + ")'>Delete</button></td>" +
        "</tr>"
    )
}

function editModal(userId) {
    $("#editModal").modal('show')
    $("#editModal .modal-header h5").text('Edit user');
    $('#submitButton').text('Edit').addClass('btn btn-primary').attr('onClick', 'updateUser('+ userId + ');');

    getRoles()
    getUserById(userId)
}

function deleteModal(userId) {
    $("#editModal").modal('show')
    $("#editModal .modal-header h5").text('Delete user');


    getRoles()
    getUserById(userId)

    $('#password').hide();
    $('#passwordLabel').hide();
    $('#name').prop('readonly', true);
    $('#lastname').prop('readonly', true);
    $('#age').prop('readonly', true);
    $('#username').prop('readonly', true);
    $('#role').prop('disabled', true);
    $('#submitButton').text('Delete').addClass('btn btn-danger').attr('onClick', 'deleteUser('+ userId + ');');
    $('#method').val('delete');
}

function deleteUser(userId) {
    fetch("/api/users/"+userId, {method: "DELETE"})
        .then((response) => {
            if (response.status === 404 || response.status === 400) {
                response.text().then((value) => console.warn("Error message: " + value));
                return;
            }
            tbody.empty();
            getAllUsers();
            $('#editModal').modal('hide');
        })
}

function createUser() {
    let form = $('#newuser');
    let user = {
        'name': form.find('#addName').val(),
        'lastname': form.find('#addLastname').val(),
        'age': parseInt(form.find('#addAge').val()),
        'username': form.find('#addUsername').val(),
        'password': form.find('#addPassword').val(),
        'roles': form.find('#roless').val().map(id => parseInt(id))
    };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    let request = new Request('/api/users', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(user)
    });
    console.log(user);
    fetch(request).then((response) => {
        response.json().then((userReturned) => {
            tbody.empty();
            getAllUsers();
            console.log(userReturned)
        })
    })

    const someTabTriggerEl = document.querySelector('#userstabletab');
    const tab = new bootstrap.Tab(someTabTriggerEl);
    clearNewFormField()
    tab.show()
}

async function updateUser(userId) {
    let form = $('#editModal');
    let user = {
        'id': userId,
        'name': form.find('#name').val(),
        'lastname': form.find('#lastname').val(),
        'age': parseInt(form.find('#age').val()),
        'username': form.find('#username').val(),
        'password': form.find('#password').val(),
        'roles': form.find('#role').val().map(id => parseInt(id))
    };
    let headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    let request = new Request("api/users/" + userId, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(user),
    });

    await fetch(request).then((response) => {
        response.json().then((userReturned) => {
            $("#name" + userReturned.id).text(userReturned.name);
            $("#lastname" + userReturned.id).text(userReturned.lastname);
            $("#age" + userReturned.id).text(userReturned.age);
            $("#username" + userReturned.id).text(userReturned.username);
            $("#role" + userReturned.id).text(userReturned.roles.map(role => role.name));
            console.log(userReturned);
            tbody.empty();
            getAllUsers();
        })
    })

    $('#editModal').modal('hide');
    console.log('hide modal')
}

function getUserById(userId) {
    fetch("api/users/" + userId).then((response) => {
        if (response.ok) {
            response.json().then((user) => {
                $('#method').val('patch');
                $('#lastname').val(user.lastname);
                $('#name').val(user.name);
                $('#age').val(user.age);
                $('#username').val(user.username);
            })
        } else {
            console.error(response.status + " - " + response.statusText);
        }
    });
}

function getRoles() {
    fetch("/api/roles").then((response) => {
        if (response.ok) {
            response.json().then((roles) => {
                let option = '';
                roles.forEach((role) => {
                    option += '<option value="' + role.id + '">' + role.role + '</option>';
                });
                $('#role').append(option);
            });
        } else {
            console.error(response.status + " - " + response.statusText);
        }
    });
}

$('#editModal').on('hidden.bs.modal', function () {
    clearModalFormField();
});

function clearModalFormField() {
    $('#name').val('').prop('readonly', false);
    $('#lastname').val('').prop('readonly', false);
    $('#age').val('').prop('readonly', false);
    $('#username').val('').prop('readonly', false);
    $('#password').show().val('').prop('readonly', false);
    $('#passwordLabel').show();
    $('#role').prop('disabled', false);
    $('#role option').remove();
    $('#submitButton').removeAttr('class').removeAttr('onClick');
}

function clearNewFormField() {
    $('#addName').val('');
    $('#addLastname').val('');
    $('#addAge').val('');
    $('#addUsername').val('');
    $('#addPassword').val('');
    $('#roless option').prop('selected', false)
}