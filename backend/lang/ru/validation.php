<?php

return [

    'required' => 'Поле :attribute обязательно для заполнения.',
    'string' => 'Поле :attribute должно быть строкой.',
    'max' => [
        'string' => 'Поле :attribute не должно содержать более :max символов.',
        'array' => 'Поле :attribute не должно содержать более :max элементов.',
        'numeric' => 'Поле :attribute не должно быть больше :max.',
        'file' => 'Размер файла :attribute не должен превышать :max КБ.',
    ],

    'email' => 'Поле :attribute должно содержать корректный адрес электронной почты.',

    'unique' => 'Такое значение поля :attribute уже используется.',

    'min' => [
        'string' => 'Поле :attribute должно содержать не менее :min символов.',
        'array' => 'Поле :attribute должно содержать не менее :min элементов.',
        'numeric' => 'Поле :attribute должно быть не меньше :min.',
        'file' => 'Размер файла :attribute должен быть не менее :min КБ.',
    ],

    'confirmed' => 'Подтверждение поля :attribute не совпадает.',

    'custom' => [],

    'attributes' => [
        'name' => 'имя',
        'email' => 'электронная почта',
        'password' => 'пароль',
        'password_confirmation' => 'подтверждение пароля',
    ],

];