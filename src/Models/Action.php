<?php

namespace Jdd\Pandemia\Models;

use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    protected $attributes = [
        'name' => '',
        'icon' => '',
        'pointer' => '',
        'actions' => '',
        'cost' => '',
    ];
    protected $guarded = [];
    protected $appends = [
        'level',
    ];
    protected $casts = [
        'automatic' => 'boolean',
    ];

    public function getLevelAttribute()
    {
        return $this->name === 'incubacion' ? 1 : 0;
    }
}
